
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE voivodeships (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(country_id, name)
);

CREATE TABLE counties (
    id SERIAL PRIMARY KEY,
    voivodeship_id INT NOT NULL REFERENCES voivodeships(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(voivodeship_id, name)
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    county_id INT NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(county_id, name)
);

CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    UNIQUE(email)
);

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    UNIQUE(email)
);


CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT NOT NULL,
    file_extension TEXT NOT NULL DEFAULT 'jpg',
    author TEXT NOT NULL,

    year_taken INT NOT NULL,
    month_taken INT,
    day_taken INT,

    country_id INT NOT NULL REFERENCES countries(id),
    voivodeship_id INT REFERENCES voivodeships(id),
    county_id INT REFERENCES counties(id),
    city_id INT REFERENCES cities(id),

    created_at TIMESTAMP DEFAULT NOW(),

    search_vector tsvector
);

-- regiony
CREATE INDEX idx_photos_country ON photos(country_id);
CREATE INDEX idx_photos_voivodeship ON photos(voivodeship_id);
CREATE INDEX idx_photos_county ON photos(county_id);
CREATE INDEX idx_photos_city ON photos(city_id);

-- data
CREATE INDEX idx_photos_year_taken ON photos(year_taken);
CREATE INDEX idx_photos_month_taken ON photos(month_taken);
CREATE INDEX idx_photos_day_taken ON photos(day_taken);

-- wyszukiwanie pełnotekstowe
CREATE INDEX idx_photos_search
ON photos
USING GIN (search_vector);

-- trigram do wyszukiwania fragmentów słów
CREATE INDEX idx_photos_title_trgm
ON photos
USING GIN (title gin_trgm_ops);

CREATE FUNCTION photos_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector(
        'simple',
        unaccent(
            coalesce(NEW.title,'') || ' ' ||
            coalesce(NEW.description,'')
        )
    );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate
BEFORE INSERT OR UPDATE
ON photos
FOR EACH ROW EXECUTE FUNCTION photos_search_update();