// API: GET /api/portal/profile  — get extended yard profile
// API: PUT /api/portal/profile  — update extended yard profile

import { requirePartner, parseBody } from './_helpers';
import { json } from '../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;

  // Get or create profile row
  let profile = await db.prepare(
    `SELECT * FROM partner_profiles WHERE user_id = ?`
  ).bind(partnerId).first();

  if (!profile) {
    // Auto-create from user record
    await db.prepare(
      `INSERT INTO partner_profiles (user_id, company_name, country) VALUES (?, ?, ?)`
    ).bind(partnerId, user!.company || user!.name || '', user!.country || '').run();
    profile = await db.prepare(
      `SELECT * FROM partner_profiles WHERE user_id = ?`
    ).bind(partnerId).first();
  }

  // Also get basic user info
  const userRec = await db.prepare(
    `SELECT email, name, role, company, phone, country, status FROM "user" WHERE id = ?`
  ).bind(partnerId).first();

  return json({ profile, user: userRec });
};

export const onRequestPut: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  // Ensure profile exists
  const existing = await db.prepare(
    `SELECT id FROM partner_profiles WHERE user_id = ?`
  ).bind(partnerId).first();

  if (!existing) {
    await db.prepare(
      `INSERT INTO partner_profiles (user_id) VALUES (?)`
    ).bind(partnerId).run();
  }

  const fields = [
    'company_name', 'org_number', 'address', 'postal_code', 'city', 'country',
    'about', 'opening_hours', 'accepts_dropoff', 'accepts_pickup',
    'offers_container', 'vehicles_scrapping', 'min_weight_kg',
    'materials', 'permit_number', 'permit_issuer', 'response_time'
  ];

  const setClauses: string[] = [];
  const binds: unknown[] = [];

  for (const f of fields) {
    if (body[f] !== undefined) {
      setClauses.push(`${f} = ?`);
      // Booleans → 0/1
      if (['accepts_dropoff', 'accepts_pickup', 'offers_container', 'vehicles_scrapping'].includes(f)) {
        binds.push(body[f] ? 1 : 0);
      } else if (f === 'min_weight_kg') {
        binds.push(body[f] ? Number(body[f]) : null);
      } else {
        binds.push(String(body[f] || '').trim() || null);
      }
    }
  }

  setClauses.push(`updated_at = datetime('now')`);
  binds.push(partnerId);

  if (setClauses.length > 1) {
    await db.prepare(
      `UPDATE partner_profiles SET ${setClauses.join(', ')} WHERE user_id = ?`
    ).bind(...binds).run();
  }

  // Also update basic user fields if provided
  if (body.name !== undefined || body.phone !== undefined) {
    const userSets: string[] = [];
    const userBinds: unknown[] = [];
    if (body.name !== undefined) { userSets.push('name = ?'); userBinds.push(String(body.name).trim()); }
    if (body.phone !== undefined) { userSets.push('phone = ?'); userBinds.push(String(body.phone).trim()); }
    userSets.push(`updatedAt = datetime('now')`);
    userBinds.push(partnerId);
    await db.prepare(`UPDATE "user" SET ${userSets.join(', ')} WHERE id = ?`).bind(...userBinds).run();
  }

  const updated = await db.prepare(
    `SELECT * FROM partner_profiles WHERE user_id = ?`
  ).bind(partnerId).first();

  return json({ ok: true, profile: updated });
};
