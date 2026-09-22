// API: GET /api/account/profile  — returns the current user's profile
// API: PUT /api/account/profile  — updates the current user's profile

import { getUser, json, handleCORS } from '../../_lib/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user) return json({ error: 'Not authenticated' }, 401);

  const profile = await db.prepare(
    'SELECT id, email, name, role, company, phone, country, status, created_at FROM users WHERE id = ?'
  ).bind(user.id).first();
  return json({ profile });
};

export const onRequestPut: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user) return json({ error: 'Not authenticated' }, 401);

  let body: { name?: string; company?: string; phone?: string; country?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  await db.prepare(
    `UPDATE users SET name = COALESCE(?, name), company = COALESCE(?, company), phone = COALESCE(?, phone), country = COALESCE(?, country), updated_at = datetime('now') WHERE id = ?`
  ).bind(body.name ?? null, body.company ?? null, body.phone ?? null, body.country ?? null, user.id).run();

  const updated = await db.prepare('SELECT id, email, name, role, company, phone, country FROM users WHERE id = ?').bind(user.id).first();
  return json({ profile: updated });
};
