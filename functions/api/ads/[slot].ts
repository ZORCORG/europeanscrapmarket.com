// API: GET /api/ads/:slot — serve an ad for a given slot name
// Returns the active ad for the slot, or null if none.

import { json, handleCORS } from '../../_lib/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const slot = context.params.slot as string;

  const url = new URL(context.request.url);
  const country = url.searchParams.get('country');

  let query = `SELECT id, advertiser_name, target_url, image_url, text, placement FROM ad_slots WHERE slot_name = ? AND active = 1 AND (starts_at IS NULL OR starts_at <= datetime('now')) AND (ends_at IS NULL OR ends_at >= datetime('now'))`;
  const binds: unknown[] = [slot];
  if (country) { query += ' AND (country = ? OR country IS NULL)'; binds.push(country); }
  query += ' ORDER BY country DESC, created_at DESC LIMIT 1';

  const ad = await db.prepare(query).bind(...binds).first();

  // Increment impressions
  if (ad) {
    await db.prepare('UPDATE ad_slots SET impressions = impressions + 1 WHERE id = ?').bind(ad.id as string).run();
  }

  return json({ ad: ad || null });
};
