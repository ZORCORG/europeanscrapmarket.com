// API: POST /api/ads/:slot/click — track ad click (increment counter)

import { json, handleCORS } from '../../../_lib/auth';

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const slot = context.params.slot as string;

  // Find the most recent active ad for this slot and increment clicks
  const ad = await db.prepare(
    `SELECT id FROM ad_slots WHERE slot_name = ? AND active = 1 ORDER BY created_at DESC LIMIT 1`
  ).bind(slot).first<{ id: string }>();

  if (ad) {
    await db.prepare('UPDATE ad_slots SET clicks = clicks + 1 WHERE id = ?').bind(ad.id).run();
  }

  return json({ ok: true });
};
