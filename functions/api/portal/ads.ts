// API: GET   /api/portal/ads — list partner's ads
// API: POST  /api/portal/ads — create an ad
// API: PUT   /api/portal/ads — update an ad (pause/activate/edit)
// API: DELETE /api/portal/ads — remove an ad

import { requirePartner, parseBody } from './_helpers';
import { json, randomToken } from '../../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const ads = await db.prepare(
    `SELECT * FROM partner_ads WHERE partner_id = ? ORDER BY created_at DESC`
  ).bind(user!.id).all();

  return json({ ads: ads.results });
};

export const onRequestPost: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const title = String(body.title || '').trim();
  const scrapClass = String(body.scrapClass || '').trim();
  const country = String(body.country || '').trim();

  if (!title || !scrapClass || !country) {
    return json({ error: 'title, scrapClass, and country are required' }, 400);
  }

  const id = randomToken(16);
  await db.prepare(
    `INSERT INTO partner_ads (id, partner_id, title, scrap_class, country, city, weight_kg, price_eur, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user!.id, title, scrapClass, country,
    String(body.city || '').trim() || null,
    body.weightKg ? Number(body.weightKg) : null,
    body.priceEur ? Number(body.priceEur) : null,
    String(body.description || '').trim() || null,
  ).run();

  return json({ ok: true, adId: id }, 201);
};

export const onRequestPut: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const adId = String(body.adId || '');
  if (!adId) return json({ error: 'adId is required' }, 400);

  // Verify ownership
  const ad = await db.prepare(
    `SELECT * FROM partner_ads WHERE id = ? AND partner_id = ?`
  ).bind(adId, user!.id).first();
  if (!ad) return json({ error: 'Ad not found' }, 404);

  const fields = ['title', 'scrap_class', 'country', 'city', 'weight_kg', 'price_eur', 'description', 'status'];
  const setClauses: string[] = [];
  const binds: unknown[] = [];

  for (const f of fields) {
    const camelKey = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (body[camelKey] !== undefined || body[f] !== undefined) {
      const val = body[camelKey] !== undefined ? body[camelKey] : body[f];
      setClauses.push(`${f} = ?`);
      if (['weight_kg', 'price_eur'].includes(f)) {
        binds.push(val ? Number(val) : null);
      } else {
        binds.push(String(val || '').trim() || null);
      }
    }
  }

  setClauses.push(`updated_at = datetime('now')`);
  binds.push(adId);

  if (setClauses.length > 1) {
    await db.prepare(
      `UPDATE partner_ads SET ${setClauses.join(', ')} WHERE id = ?`
    ).bind(...binds).run();
  }

  const updated = await db.prepare(
    `SELECT * FROM partner_ads WHERE id = ?`
  ).bind(adId).first();

  return json({ ok: true, ad: updated });
};

export const onRequestDelete: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const url = new URL(context.request.url);
  const adId = url.searchParams.get('id');

  if (!adId) return json({ error: 'id parameter is required' }, 400);

  const ad = await db.prepare(
    `SELECT * FROM partner_ads WHERE id = ? AND partner_id = ?`
  ).bind(adId, user!.id).first();
  if (!ad) return json({ error: 'Ad not found' }, 404);

  await db.prepare(
    `DELETE FROM partner_ads WHERE id = ?`
  ).bind(adId).run();

  return json({ ok: true });
};
