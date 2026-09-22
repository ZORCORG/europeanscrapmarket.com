// API: PATCH /api/admin/partners?id=... — approve or reject a partner application (admin only)

import { getSessionUser } from '../../../src/lib/auth';
import { json, handleCORS } from '../../_lib/utils';

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

  // If approved, upgrade the user's role to partner
  if (body.status === 'approved') {
    const app = await db.prepare('SELECT email, contact_name, country FROM partner_applications WHERE id = ?').bind(id).first<{ email: string; contact_name: string; country: string }>();
    if (app) {
      await db.prepare(
        'UPDATE "user" SET role = \'partner\', updatedAt = datetime(\'now\') WHERE email = ?'
      ).bind(app.email.toLowerCase()).run();
    }
  }

  return json({ ok: true });
};
