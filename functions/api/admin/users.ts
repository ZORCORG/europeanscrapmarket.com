// API: GET /api/admin/users — list all users (admin only)
// API: PATCH /api/admin/users?id=... — update user role/status (admin only)

import { getUser, json, handleCORS, randomToken } from '../../_lib/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const users = await db.prepare(
    'SELECT id, email, name, role, company, phone, country, status, created_at FROM users ORDER BY created_at DESC LIMIT 200'
  ).all();

  return json({ users: users.results });
};

export const onRequestPost: PagesFunction = async (context) => {
  // Create a new admin/partner user manually
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  let body: { email?: string; name?: string; role?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return json({ error: 'Valid email required' }, 400);
  const role = body.role || 'partner';
  if (!['buyer', 'partner', 'admin'].includes(role)) return json({ error: 'Invalid role' }, 400);

  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: 'User already exists' }, 409);

  const userId = randomToken(16);
  await db.prepare('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)').bind(userId, email, body.name || '', role).run();
  return json({ ok: true, id: userId }, 201);
};

export const onRequestPatch: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'User ID is required' }, 400);

  let body: { role?: string; status?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const updates: string[] = [];
  const binds: unknown[] = [];
  if (body.role && ['buyer', 'partner', 'admin'].includes(body.role)) { updates.push('role = ?'); binds.push(body.role); }
  if (body.status && ['active', 'suspended', 'pending'].includes(body.status)) { updates.push('status = ?'); binds.push(body.status); }
  if (!updates.length) return json({ error: 'Nothing to update' }, 400);

  updates.push("updated_at = datetime('now')");
  binds.push(id);
  await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
  return json({ ok: true });
};
