// API: GET  /api/portal/prices — get partner's material price book
// API: PUT  /api/portal/prices — update prices (bulk)
// Body: { prices: [{ scrapClass, pricePerKg, currency, unit }] }

import { requirePartner, parseBody } from './_helpers';
import { json, randomToken } from '../../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const prices = await db.prepare(
    `SELECT * FROM material_prices WHERE partner_id = ? ORDER BY scrap_class`
  ).bind(user!.id).all();

  return json({ prices: prices.results });
};

export const onRequestPut: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const body = await parseBody(context.request);
  if (!body || !Array.isArray(body.prices)) return json({ error: 'prices array required' }, 400);

  // Delete existing prices and re-insert (simple bulk replace)
  await db.prepare(`DELETE FROM material_prices WHERE partner_id = ?`).bind(partnerId).run();

  for (const p of body.prices as Record<string, unknown>[]) {
    const scrapClass = String(p.scrapClass || '').trim();
    if (!scrapClass) continue;
    const id = randomToken(16);
    await db.prepare(
      `INSERT INTO material_prices (id, partner_id, scrap_class, price_per_kg, currency, unit)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id, partnerId, scrapClass,
      p.pricePerKg ? Number(p.pricePerKg) : null,
      String(p.currency || 'EUR'),
      String(p.unit || 'kg'),
    ).run();
  }

  const updated = await db.prepare(
    `SELECT * FROM material_prices WHERE partner_id = ? ORDER BY scrap_class`
  ).bind(partnerId).all();

  return json({ ok: true, prices: updated.results });
};
