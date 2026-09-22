// API: POST /api/leads — create a new scrap submission (lead)
// API: GET  /api/leads — list leads (admin only)

import { getSessionUser } from '../../src/lib/auth';
import { json, handleCORS } from '../_lib/utils';

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';

  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const country = String(body.country || '').trim();

  if (!name || !email || !country) return json({ error: 'name, email, and country are required' }, 400);
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return json({ error: 'Valid email is required' }, 400);

  const user = await getSessionUser(db, secret, siteUrl, context.request);

  await db.prepare(
    `INSERT INTO leads (user_id, name, email, phone, country, city, scrap_class, weight_kg, description, photos_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    user?.id ?? null,
    name, email,
    String(body.phone || '').trim() || null,
    country,
    String(body.city || '').trim() || null,
    String(body.scrapClass || '').trim() || null,
    body.weightKg ? Number(body.weightKg) : null,
    String(body.description || '').trim(),
    Number(body.photosCount || 0),
  ).run();

  return json({ ok: true, message: 'Your scrap listing has been submitted. A verified yard will contact you.' }, 201);
};

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const url = new URL(context.request.url);
  const status = url.searchParams.get('status') || 'new';
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

  const leads = await db.prepare(
    `SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ?`
  ).bind(status, limit).all();

  return json({ leads: leads.results });
};
