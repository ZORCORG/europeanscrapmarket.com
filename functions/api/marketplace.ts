// API: GET /api/marketplace — public aggregated marketplace listings
// Unifies `listings` table and `partner_ads` (status='active') into one feed.
// Query params: country, scrapClass, limit

import { json, handleCORS } from '../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const url = new URL(context.request.url);
  const country = url.searchParams.get('country');
  const scrapClass = url.searchParams.get('scrapClass');
  const limit = Math.min(Number(url.searchParams.get('limit') || 48), 100);

  // Query partner_ads (active) — these are the primary marketplace content
  let adsQuery = `SELECT id, title, scrap_class, country, city, weight_kg, price_eur, description, created_at, 'partner_ad' as source FROM partner_ads WHERE status = 'active'`;
  const adsBinds: unknown[] = [];
  if (country) { adsQuery += ' AND country = ?'; adsBinds.push(country); }
  if (scrapClass) { adsQuery += ' AND scrap_class = ?'; adsBinds.push(scrapClass); }
  adsQuery += ' ORDER BY created_at DESC LIMIT ?';
  adsBinds.push(limit);

  const adsStmt = db.prepare(adsQuery);
  const ads = adsBinds.length ? await adsStmt.bind(...adsBinds).all() : await adsStmt.all();

  // Also query listings table (active)
  let lstQuery = `SELECT id, title, scrap_class, country, city, weight_kg, price_eur, description, created_at, 'listing' as source FROM listings WHERE status = 'active'`;
  const lstBinds: unknown[] = [];
  if (country) { lstQuery += ' AND country = ?'; lstBinds.push(country); }
  if (scrapClass) { lstQuery += ' AND scrap_class = ?'; lstBinds.push(scrapClass); }
  lstQuery += ' ORDER BY created_at DESC LIMIT ?';
  lstBinds.push(limit);

  const lstStmt = db.prepare(lstQuery);
  const lst = lstBinds.length ? await lstStmt.bind(...lstBinds).all() : await lstStmt.all();

  // Merge and sort by created_at DESC
  const all = [...ads.results, ...lst.results].sort((a, b) => {
    const aDate = new Date((a as Record<string, unknown>).created_at as string).getTime();
    const bDate = new Date((b as Record<string, unknown>).created_at as string).getTime();
    return bDate - aDate;
  }).slice(0, limit);

  return json({ listings: all, total: all.length });
};
