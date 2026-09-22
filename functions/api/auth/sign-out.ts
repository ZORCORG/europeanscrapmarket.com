// API: POST /api/auth/sign-out
// Clears the session cookie and removes the session from D1.

import { clearSessionCookie, json, parseCookies, hashToken, handleCORS } from '../../_lib/auth';

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const cookies = parseCookies(context.request.headers.get('Cookie'));
  const token = cookies['session'];

  if (token) {
    const tokenHash = await hashToken(token);
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
  }

  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
};
