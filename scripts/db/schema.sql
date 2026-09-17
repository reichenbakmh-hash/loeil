CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_event_id TEXT NOT NULL,
  event_date TEXT NOT NULL,
  country_iso TEXT,
  region TEXT,
  latitude REAL,
  longitude REAL,
  event_type TEXT,
  sub_event_type TEXT,
  actors TEXT,
  fatalities INTEGER DEFAULT 0,
  summary TEXT,
  raw_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, source_event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country_iso);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);

CREATE TABLE IF NOT EXISTS countries (
  iso TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  coface_risk TEXT,
  crisiswatch_trend TEXT,
  last_updated TEXT
);

CREATE TABLE IF NOT EXISTS country_indicators (
  country_iso TEXT NOT NULL,
  indicator_code TEXT NOT NULL,
  indicator_label TEXT NOT NULL,
  year INTEGER NOT NULL,
  value REAL,
  source TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (country_iso, indicator_code, year, source)
);

CREATE INDEX IF NOT EXISTS idx_indicators_country ON country_indicators(country_iso);
CREATE INDEX IF NOT EXISTS idx_indicators_code ON country_indicators(indicator_code);

CREATE TABLE IF NOT EXISTS stats_daily (
  date TEXT NOT NULL,
  country_iso TEXT NOT NULL,
  source TEXT NOT NULL,
  event_count INTEGER DEFAULT 0,
  fatalities INTEGER DEFAULT 0,
  PRIMARY KEY (date, country_iso, source)
);

CREATE TABLE IF NOT EXISTS sources_status (
  source TEXT PRIMARY KEY,
  last_run TEXT,
  status TEXT,
  error_message TEXT,
  records_fetched INTEGER DEFAULT 0
);
