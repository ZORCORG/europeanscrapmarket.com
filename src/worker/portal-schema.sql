-- Portal schema migration — adds partner portal tables
-- Run: npx wrangler d1 execute esm-db --remote --file=src/worker/portal-schema.sql

-- Extend leads table with partner workflow columns
ALTER TABLE leads ADD COLUMN assigned_partner_id TEXT REFERENCES "user"(id);
ALTER TABLE leads ADD COLUMN accepted_bid_id TEXT;
-- New statuses: new → bidding → assigned → completed → archived
-- (existing CHECK constraint can't be altered in SQLite, so we rely on app logic)

-- Bids on leads (partners bid on scrap requests)
CREATE TABLE IF NOT EXISTS bids (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lead_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  price_eur REAL,
  price_per_kg REAL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','withdrawn')),
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (partner_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_bids_lead ON bids(lead_id);
CREATE INDEX IF NOT EXISTS idx_bids_partner ON bids(partner_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Chat messages between seller and partner
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lead_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK(sender_role IN ('seller','partner','admin')),
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_lead ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(lead_id, read_at);

-- Geographic zones for partner coverage (country + region)
CREATE TABLE IF NOT EXISTS zones (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  partner_id TEXT,
  locked_at TEXT,
  locked_until TEXT,
  price_monthly REAL NOT NULL DEFAULT 14.90,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(country, region),
  FOREIGN KEY (partner_id) REFERENCES "user"(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_zones_country ON zones(country);
CREATE INDEX IF NOT EXISTS idx_zones_partner ON zones(partner_id);

-- Extended partner/yard profile
CREATE TABLE IF NOT EXISTS partner_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE,
  company_name TEXT,
  org_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  logo_url TEXT,
  about TEXT,
  opening_hours TEXT,
  accepts_dropoff INTEGER NOT NULL DEFAULT 1,
  accepts_pickup INTEGER NOT NULL DEFAULT 0,
  offers_container INTEGER NOT NULL DEFAULT 0,
  vehicles_scrapping INTEGER NOT NULL DEFAULT 0,
  min_weight_kg REAL,
  materials TEXT,
  trust_status TEXT NOT NULL DEFAULT 'pending' CHECK(trust_status IN ('pending','verified','rejected')),
  permit_number TEXT,
  permit_issuer TEXT,
  response_time TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Material price book (partner's prices per scrap class)
CREATE TABLE IF NOT EXISTS material_prices (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  partner_id TEXT NOT NULL,
  scrap_class TEXT NOT NULL,
  price_per_kg REAL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  unit TEXT NOT NULL DEFAULT 'kg',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (partner_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prices_partner ON material_prices(partner_id);

-- Subscriptions/billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free','pro','zones')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','cancelled','past_due')),
  price_monthly REAL NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK(billing_cycle IN ('monthly','quarterly')),
  zones_count INTEGER NOT NULL DEFAULT 0,
  current_period_end TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions(user_id);

-- Partner ads (listings posted by partners)
CREATE TABLE IF NOT EXISTS partner_ads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  partner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  scrap_class TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  weight_kg REAL,
  price_eur REAL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','removed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (partner_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pads_partner ON partner_ads(partner_id);
CREATE INDEX IF NOT EXISTS idx_pads_status ON partner_ads(status);
