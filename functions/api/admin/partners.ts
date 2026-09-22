// API: PATCH /api/admin/partners?id=... — approve or reject a partner application (admin only)

import { getUser, json, handleCORS, randomToken } from '../../_lib/auth';

export const onRequestPatch: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Application ID is required' }, 400);

  let body: { status?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const validStatus = ['pending', 'approved', 'rejected'];
  if (!body.status || !validStatus.includes(body.status)) {
    return json({ error: 'Valid status required' }, 400);
  }

  await db.prepare('UPDATE partner_applications SET status = ? WHERE id = ?').bind(body.status, id).run();

  // If approved, create a user account with partner role
  if (body.status === 'approved') {
    const app = await db.prepare('SELECT email, contact_name, country FROM partner_applications WHERE id = ?').bind(id).first<{ email: string; contact_name: string; country: string }>();
    if (app) {
      const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(app.email).first();
      if (!existing) {
        const userId = randomToken(16);
        await db.prepare(
          'INSERT INTO users (id, email, name, role, country) VALUES (?, ?, ?, ?, ?)'
        ).bind(userId, app.email, app.contact_name, 'partner', app.country).run();
      } else {
        await db.prepare('UPDATE users SET role = \'partner\' WHERE email = ?').bind(app.email).run();
      }
    }
  }

  return json({ ok: true });
};
