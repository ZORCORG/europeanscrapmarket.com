// API: GET /api/auth/verify?token=...
// Verifies a magic link token and creates a session.
// If the email doesn't exist, a new buyer account is created.

import { randomToken, hashToken, signJWT, json, getSecret, setSessionCookie, handleCORS } from '../../_lib/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = getSecret(env);
  const token = context.request.url;

  const url = new URL(context.request.url);
  const tokenParam = url.searchParams.get('token');
  if (!tokenParam) return json({ error: 'Missing token' }, 400);

  // Look up magic link
  const link = await db.prepare(
    `SELECT email, expires_at, used FROM magic_links WHERE token = ?`
  ).bind(tokenParam).first<{ email: string; expires_at: string; used: number }>();

  if (!link) return json({ error: 'Invalid or expired link' }, 400);
  if (link.used) return json({ error: 'This link has already been used' }, 410);
  if (new Date(link.expires_at) < new Date()) return json({ error: 'This link has expired' }, 410);

  // Mark as used
  await db.prepare('UPDATE magic_links SET used = 1 WHERE token = ?').bind(tokenParam).run();

  // Find or create user
  let user = await db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').bind(link.email).first<{ id: string; email: string; name: string; role: string }>();
  if (!user) {
    const userId = randomToken(16);
    await db.prepare('INSERT INTO users (id, email, role) VALUES (?, ?, ?)').bind(userId, link.email, 'buyer').run();
    user = { id: userId, email: link.email, name: '', role: 'buyer' };
  }

  // Create session
  const sessionToken = randomToken();
  const tokenHash = await hashToken(sessionToken);
  const expires = new Date(Date.now() + 7 * 86400 * 1000).toISOString();
  await db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)').bind(user.id, tokenHash, expires).run();

  // Sign JWT
  const jwt = await signJWT({ sid: user.id, email: user.email, role: user.role }, secret);

  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${siteUrl}/account`,
      'Set-Cookie': setSessionCookie(jwt),
    },
  });
};

export const onRequestOptions: PagesFunction = async (context) => handleCORS(context.request) ?? json({ ok: true });
