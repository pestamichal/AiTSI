import json
import zeep
from zeep import Client
from zeep.wsse.username import UsernameToken

# ---------------------------------------------------------------------------
# Konfiguracja
# ---------------------------------------------------------------------------

WSDL_URL  = "https://uslugaterytws1test.stat.gov.pl/wsdl/terytws1.wsdl"
LOGIN     = "TestPubliczny"
HASLO     = "1234abcd"

OUTPUT_FILE = "polska_administracja.json"

# ---------------------------------------------------------------------------
# Pomocnicze
# ---------------------------------------------------------------------------

def buduj_klienta() -> Client:
    """Tworzy klienta SOAP z mechanizmem WS-Security (UsernameToken over TLS)."""
    wsse = UsernameToken(LOGIN, HASLO)
    client = Client(wsdl=WSDL_URL, wsse=wsse)
    return client


def pobierz_date_aktualnego_katalogu(client: Client) -> str:
    """Zwraca datę bieżącego stanu katalogów TERC i SIMC (format YYYY-MM-DD)."""
    data = client.service.PobierzDateAktualnegoKatTerc()
    # Wynik to datetime – konwertujemy do stringa wymaganego przez kolejne metody
    return data.strftime("%Y-%m-%d") if hasattr(data, "strftime") else str(data)


# ---------------------------------------------------------------------------
# Pobieranie danych
# ---------------------------------------------------------------------------

def pobierz_wojewodztwa(client: Client, data_stanu: str) -> list:
    return client.service.PobierzListeWojewodztw(DataStanu=data_stanu)


def pobierz_powiaty(client: Client, woj: str, data_stanu: str) -> list:
    return client.service.PobierzListePowiatow(Woj=woj, DataStanu=data_stanu)


def pobierz_miejscowosci(client: Client,
                         woj: str, pow: str, gmi: str, rodz: str,
                         data_stanu: str) -> list:
    """
    PobierzListeMiejscowosciWRodzajuGminie wymaga symboli gminy.
    Dla każdej gminy zwraca listę obiektów Miejscowosc.
    """
    return client.service.PobierzListeMiejscowosciWRodzajuGminy(
        symbolWoj=woj,
        symbolPow=pow,
        symbolGmi=gmi,
        symbolRodz=rodz,
        DataStanu=data_stanu,
    )


def pobierz_gminy(client: Client, woj: str, pow: str, data_stanu: str) -> list:
    return client.service.PobierzListeGmin(
        Woj=woj, Pow=pow, DataStanu=data_stanu
    )


# ---------------------------------------------------------------------------
# Główna logika
# ---------------------------------------------------------------------------

def zbierz_dane() -> dict:
    print("Łączenie z usługą TERYT ws1…")
    client = buduj_klienta()

    # Weryfikacja logowania
    zalogowany = client.service.CzyZalogowany()
    if not zalogowany:
        raise RuntimeError("Błąd autoryzacji – sprawdź login i hasło.")
    print("✓ Zalogowano pomyślnie.")

    data_stanu = pobierz_date_aktualnego_katalogu(client)
    print(f"✓ Data aktualnego katalogu TERC: {data_stanu}")

    struktura = {"Polska": {}}

    wojewodztwa = pobierz_wojewodztwa(client, data_stanu)
    print(f"✓ Pobrano {len(wojewodztwa)} województw.")

    for woj in wojewodztwa:
        nazwa_woj   = woj.NAZWA
        symbol_woj  = woj.WOJ
        print(f"\n  → Województwo: {nazwa_woj} ({symbol_woj})")

        struktura["Polska"][nazwa_woj] = {}

        powiaty = pobierz_powiaty(client, symbol_woj, data_stanu)
        print(f"     Powiatów: {len(powiaty)}")

        for pow in powiaty:
            nazwa_pow  = pow.NAZWA
            symbol_pow = pow.POW
            print(f"     • Powiat: {nazwa_pow} ({symbol_pow})", end=" ", flush=True)

            struktura["Polska"][nazwa_woj][nazwa_pow] = []

            # Każdy powiat może mieć wiele gmin – iterujemy po gminach
            gminy = pobierz_gminy(client, symbol_woj, symbol_pow, data_stanu)

            miasta_w_powiecie: list[str] = []

            for gmi in gminy:
                symbol_gmi  = gmi.GMI
                symbol_rodz = gmi.RODZ

                try:
                    miejscowosci = pobierz_miejscowosci(
                        client,
                        woj=symbol_woj,
                        pow=symbol_pow,
                        gmi=symbol_gmi,
                        rodz=symbol_rodz,
                        data_stanu=data_stanu,
                    )
                    for m in miejscowosci:
                        nazwa_m = m.Nazwa
                        if nazwa_m and nazwa_m not in miasta_w_powiecie:
                            miasta_w_powiecie.append(nazwa_m)
                except Exception as e:
                    # Niektóre gminy mogą nie mieć miejscowości w danej wersji
                    print(f"\n       [WARN] {gmi.NAZWA}: {e}", end="")

            miejscowosci_posortowane = sorted(miasta_w_powiecie)
            struktura["Polska"][nazwa_woj][nazwa_pow] = miejscowosci_posortowane
            print(f"– {len(miejscowosci_posortowane)} miejscowości")

    return struktura


# ---------------------------------------------------------------------------
# Zapis do pliku
# ---------------------------------------------------------------------------

def zapisz_json(dane: dict, sciezka: str) -> None:
    with open(sciezka, "w", encoding="utf-8") as f:
        json.dump(dane, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Dane zapisane do pliku: {sciezka}")


# ---------------------------------------------------------------------------
# Uruchomienie
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        dane = zbierz_dane()
        zapisz_json(dane, OUTPUT_FILE)

        # Podgląd struktury
        print("\n--- Podgląd (pierwsze województwo) ---")
        pierwsze_woj = next(iter(dane["Polska"].items()))
        woj_nazwa, powiaty = pierwsze_woj
        print(f"Polska → {woj_nazwa}:")
        for pow_nazwa, miasta in list(powiaty.items())[:3]:
            print(f"  {pow_nazwa}: {miasta[:5]}{'…' if len(miasta) > 5 else ''}")

    except Exception as ex:
        print(f"\n✗ Błąd: {ex}")
        raise