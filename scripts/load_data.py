#!/usr/bin/env python3
"""
Ładuje hierarchię z polska_administracja.json do PostgreSQL zgodnie z init.sql.
Uruchom po wykonaniu init.sql na pustej bazie (lub z idempotentnymi INSERT-ami poniżej).
"""
import json
import os
import sys

import psycopg2
from psycopg2.extras import execute_values


DSN = "postgresql://postgres:secret@localhost:5432/aitsi"


def get_or_create_country(cur, name: str) -> int:
    cur.execute(
        "INSERT INTO countries (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
        (name,),
    )
    cur.execute("SELECT id FROM countries WHERE name = %s", (name,))
    return cur.fetchone()[0]


def get_or_create_voivodeship(cur, country_id: int, name: str) -> int:
    cur.execute(
        """
        INSERT INTO voivodeships (country_id, name) VALUES (%s, %s)
        ON CONFLICT (country_id, name) DO NOTHING
        """,
        (country_id, name),
    )
    cur.execute(
        "SELECT id FROM voivodeships WHERE country_id = %s AND name = %s",
        (country_id, name),
    )
    return cur.fetchone()[0]


def get_or_create_county(cur, voivodeship_id: int, name: str) -> int:
    cur.execute(
        """
        INSERT INTO counties (voivodeship_id, name) VALUES (%s, %s)
        ON CONFLICT (voivodeship_id, name) DO NOTHING
        """,
        (voivodeship_id, name),
    )
    cur.execute(
        "SELECT id FROM counties WHERE voivodeship_id = %s AND name = %s",
        (voivodeship_id, name),
    )
    return cur.fetchone()[0]


def load_json(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    if len(sys.argv) < 2:
        print("Użycie: python load_polska_administracja.py polska_administracja.json")
        sys.exit(1)

    data = load_json(sys.argv[1])

    conn = psycopg2.connect(DSN)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            for country_name, voivodes in data.items():
                cid = get_or_create_country(cur, country_name)
                for voiv_name, counties in voivodes.items():
                    vid = get_or_create_voivodeship(cur, cid, voiv_name)
                    for county_name, cities in counties.items():
                        if not isinstance(cities, list):
                            continue
                        county_id = get_or_create_county(cur, vid, county_name)
                        # batch insert miast (puste listy pomijamy)
                        rows = [(county_id, c) for c in cities if c]
                        if not rows:
                            continue
                        execute_values(
                            cur,
                            """
                            INSERT INTO cities (county_id, name)
                            VALUES %s
                            ON CONFLICT (county_id, name) DO NOTHING
                            """,
                            rows,
                            page_size=5000,
                        )
        conn.commit()
        print("Załadowano dane.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()