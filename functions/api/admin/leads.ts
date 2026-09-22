// API: PATCH /api/admin/leads?id=... — update lead status (admin only)

import { getUser, json, handleCORS } from '../../_lib/auth';

export const onRequestPatch: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Lead ID is required' }, 400);

  let body: { status?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const validStatus = ['new', 'contacted', 'completed', 'archived'];
  if (!body.status || !validStatus.includes(body.status)) {
    return json({ error: 'Valid status required' }, 400);
  }

  await db.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(body.status, id).run();
  return json({ ok: true });
};
