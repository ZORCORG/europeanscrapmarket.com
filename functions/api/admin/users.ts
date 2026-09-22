// API: GET /api/admin/users — list all users (admin only)
// API: PATCH /api/admin/users?id=... — update user role/status (admin only)

import { getSessionUser } from '../../../src/lib/auth';
import { json, handleCORS } from '../../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const users = await db.prepare(
    'SELECT id, email, name, role, company, phone, country, status, createdAt FROM "user" ORDER BY createdAt DESC LIMIT 200'
  ).all();

  return json({ users: users.results });
};

export const onRequestPatch: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
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
  if (body.role && ['buyer', 'partner', 'admin'].includes(body.role)) {
    updates.push('role = ?');
    binds.push(body.role);
  }
  if (body.status && ['active', 'suspended', 'pending'].includes(body.status)) {
    updates.push('status = ?');
    binds.push(body.status);
  }
  if (!updates.length) return json({ error: 'Nothing to update' }, 400);

  updates.push("updatedAt = datetime('now')");
  binds.push(id);
  await db.prepare(`UPDATE "user" SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
  return json({ ok: true });
};
