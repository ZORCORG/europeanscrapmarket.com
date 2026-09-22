-- European Scrap Market — D1 schema
-- Run: npx wrangler d1 execute esm-db --file=src/worker/schema.sql

-- Users: sellers, partners (scrap yards), admins
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK(role IN ('buyer','partner','admin')),
  company TEXT,
  phone TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','pending')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Magic link tokens for passwordless auth
CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_magic_token ON magic_links(token);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

-- Scrap submissions (leads from sellers)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  city TEXT,
  scrap_class TEXT NOT NULL,
  weight_kg REAL,
  description TEXT NOT NULL,
  photos_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','completed','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);

-- Partner applications (scrap yards wanting to join)
CREATE TABLE IF NOT EXISTS partner_applications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  website TEXT,
  yards_count INTEGER DEFAULT 1,
  metals TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partner_status ON partner_applications(status);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  title TEXT NOT NULL,
  scrap_class TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  weight_kg REAL,
  price_eur REAL,
  description TEXT,
  photos_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','sold','expired','removed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_country ON listings(country);

-- Ad slots for the custom ad engine
CREATE TABLE IF NOT EXISTS ad_slots (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slot_name TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  image_url TEXT,
  text TEXT,
  placement TEXT NOT NULL DEFAULT 'sidebar' CHECK(placement IN ('nav','sidebar','inline','footer')),
  country TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ads_active ON ad_slots(active, placement);
