// API: POST /api/auth/sign-in/magic-link
// Body: { email: string }
// Sends a magic link to the email (in production) or returns it (in dev).

import { randomToken, json, getSecret, handleCORS } from '../../../_lib/auth';

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;

  let body: { email?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return json({ error: 'Valid email is required' }, 400);
  }

  // Rate limit: max 3 magic links per email per hour
  const recent = await db.prepare(
    `SELECT COUNT(*) as count FROM magic_links WHERE email = ? AND created_at > datetime('now', '-1 hour')`
  ).bind(email).first<{ count: number }>();
  if (recent && recent.count >= 3) {
    return json({ error: 'Too many requests. Try again in an hour.' }, 429);
  }

  const token = randomToken();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await db.prepare(
    'INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)'
  ).bind(email, token, expires).run();

  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const magicLink = `${siteUrl}/verify?token=${token}`;

  // In production, send email via Resend/Mailgun/etc.
  // In dev, return the link so the developer can test.
  const hasMailKey = !!env.RESEND_API_KEY;
  if (hasMailKey) {
    // Send via Resend API
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'European Scrap Market <noreply@europeanscrapmarket.com>',
          to: [email],
          subject: 'Your sign-in link',
          html: `<p>Click <a href="${magicLink}">here</a> to sign in to European Scrap Market.</p><p>This link expires in 15 minutes.</p>`,
        }),
      });
    } catch {
      // Fall through to dev mode
    }
  }

  return json({
    ok: true,
    message: 'If an account exists, a sign-in link has been sent to your email.',
    ...(env.NODE_ENV === 'development' || !hasMailKey ? { devLink: magicLink } : {}),
  });
};
