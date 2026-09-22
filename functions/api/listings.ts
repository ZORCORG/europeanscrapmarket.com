// API: GET  /api/listings — public list of active marketplace listings
// API: POST /api/listings — create a listing (authenticated)

import { getUser, json, handleCORS } from '../_lib/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const url = new URL(context.request.url);
  const country = url.searchParams.get('country');
  const limit = Math.min(Number(url.searchParams.get('limit') || 24), 100);

  let query = 'SELECT id, title, scrap_class, country, city, weight_kg, price_eur, description, photos_count, created_at FROM listings WHERE status = \'active\'';
  const binds: unknown[] = [];
  if (country) { query += ' AND country = ?'; binds.push(country); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const stmt = db.prepare(query);
  const listings = await (binds.length ? stmt.bind(...binds) : stmt).all();
  return json({ listings: listings.results });
};

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user) return json({ error: 'You must be signed in to create a listing' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const title = String(body.title || '').trim();
  const scrapClass = String(body.scrapClass || '').trim();
  const country = String(body.country || '').trim();
  const description = String(body.description || '').trim();

  if (!title || !scrapClass || !country || !description) {
    return json({ error: 'title, scrapClass, country, and description are required' }, 400);
  }

  const result = await db.prepare(
    `INSERT INTO listings (user_id, title, scrap_class, country, city, weight_kg, price_eur, description, photos_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(
    user.id, title, scrapClass, country,
    String(body.city || '').trim() || null,
    body.weightKg ? Number(body.weightKg) : null,
    body.priceEur ? Number(body.priceEur) : null,
    description,
    Number(body.photosCount || 0),
  ).first<{ id: string }>();

  return json({ ok: true, id: result?.id }, 201);
};
