// API: GET  /api/portal/zones — list all zones (optionally filter by country)
// API: POST /api/portal/zones — lock a zone for the partner
// API: DELETE /api/portal/zones — unlock a zone
// Body: { country, region }

import { requirePartner, parseBody } from './_helpers';
import { json } from '../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const url = new URL(context.request.url);
  const country = url.searchParams.get('country');

  let query = `SELECT * FROM zones`;
  let binds: unknown[] = [];
  if (country) {
    query += ` WHERE country = ?`;
    binds = [country];
  }
  query += ` ORDER BY country, region`;

  const zones = await db.prepare(query).bind(...binds).all();

  // Mark which zones belong to this partner
  const zonesWithOwnership = zones.results.map((z: Record<string, unknown>) => ({
    ...z,
    isMine: z.partner_id === user!.id,
  }));

  return json({ zones: zonesWithOwnership, partnerId: user!.id });
};

export const onRequestPost: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const country = String(body.country || '').trim();
  const region = String(body.region || '').trim();
  if (!country || !region) return json({ error: 'country and region are required' }, 400);

  // Check if zone exists and is available
  const zone = await db.prepare(
    `SELECT * FROM zones WHERE country = ? AND region = ?`
  ).bind(country, region).first<Record<string, unknown>>();

  if (zone && zone.partner_id && zone.partner_id !== partnerId) {
    return json({ error: 'This zone is already locked by another partner' }, 409);
  }

  if (zone && zone.partner_id === partnerId) {
    return json({ ok: true, message: 'You already own this zone', zone });
  }

  // Lock the zone — create if needed, or take ownership
  if (!zone) {
    await db.prepare(
      `INSERT INTO zones (country, region, partner_id, locked_at, locked_until)
       VALUES (?, ?, ?, datetime('now'), datetime('now', '+16 hours'))`
    ).bind(country, region, partnerId).run();
  } else {
    await db.prepare(
      `UPDATE zones SET partner_id = ?, locked_at = datetime('now'), locked_until = datetime('now', '+16 hours')
       WHERE country = ? AND region = ?`
    ).bind(partnerId, country, region).run();
  }

  // Update subscription zone count
  await db.prepare(
    `INSERT INTO subscriptions (user_id, plan, zones_count)
     VALUES (?, 'zones', 1)
     ON CONFLICT(user_id) DO UPDATE SET zones_count = zones_count + 1, updated_at = datetime('now')`
  ).bind(partnerId).run();

  const updated = await db.prepare(
    `SELECT * FROM zones WHERE country = ? AND region = ?`
  ).bind(country, region).first();

  return json({ ok: true, zone: updated }, 201);
};

export const onRequestDelete: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const country = String(body.country || '').trim();
  const region = String(body.region || '').trim();
  if (!country || !region) return json({ error: 'country and region are required' }, 400);

  const zone = await db.prepare(
    `SELECT * FROM zones WHERE country = ? AND region = ? AND partner_id = ?`
  ).bind(country, region, partnerId).first();

  if (!zone) return json({ error: 'Zone not found or not owned by you' }, 404);

  await db.prepare(
    `UPDATE zones SET partner_id = NULL, locked_at = NULL, locked_until = NULL
     WHERE country = ? AND region = ?`
  ).bind(country, region).run();

  await db.prepare(
    `UPDATE subscriptions SET zones_count = MAX(0, zones_count - 1), updated_at = datetime('now')
     WHERE user_id = ?`
  ).bind(partnerId).run();

  return json({ ok: true });
};
