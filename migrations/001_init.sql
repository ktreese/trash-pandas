-- Trash Pandas 14U — initial schema
CREATE TABLE IF NOT EXISTS media (
  id            SERIAL PRIMARY KEY,
  blob_url      TEXT    NOT NULL,
  blob_pathname TEXT    NOT NULL UNIQUE,
  content_type  TEXT    NOT NULL,
  caption       TEXT,
  uploader_name TEXT,
  size          BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS media_created_at_idx ON media (created_at DESC);
