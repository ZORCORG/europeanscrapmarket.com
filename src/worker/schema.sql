-- European Scrap Market — D1 schema (Better Auth + app tables)
-- Run: npx wrangler d1 execute esm-db --remote --file=src/worker/schema.sql

-- ═══════════════════════════════════════════════════════════════
-- Better Auth core tables
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  role TEXT NOT NULL DEFAULT 'buyer',
  company TEXT,
  phone TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY NOT NULL,
  expiresAt TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"(userId);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  password TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"(userId);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);

-- ═══════════════════════════════════════════════════════════════
-- App tables
-- ═══════════════════════════════════════════════════════════════

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

-- Ad click tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ad_id TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_adclicks_ad ON ad_clicks(ad_id);
