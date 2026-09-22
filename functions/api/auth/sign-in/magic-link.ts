// API: POST /api/auth/sign-in/magic-link
// Body: { email: string }
// Sends a magic link via Cloudflare Email Routing (esm-email-worker), or returns devLink if no key.

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

  const htmlBody = [
    `<p>Click <a href="${magicLink}">here</a> to sign in to European Scrap Market.</p>`,
    `<p>This link expires in 15 minutes. If you did not request it, ignore this email.</p>`,
    `<p style="color:#999;font-size:12px;margin-top:24px">European Scrap Market — europeanscrapmarket.com</p>`,
  ].join('');

  // Send via esm-email-worker (Cloudflare Email Routing)
  const workerKey = env.EMAIL_WORKER_KEY as string | undefined;
  const workerUrl = (env.EMAIL_WORKER_URL as string) || 'https://esm-email-worker.zebulon-d11.workers.dev';
  let emailSent = false;

  if (workerKey) {
    try {
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Email-Worker-Key': workerKey,
        },
        body: JSON.stringify({
          to: email,
          subject: 'Your sign-in link — European Scrap Market',
          html: htmlBody,
        }),
      });
      emailSent = res.ok;
    } catch (err) {
      console.error('Email worker call failed:', err);
    }
  }

  // Return devLink if email sending not configured or failed
  return json({
    ok: true,
    message: 'If an account exists, a sign-in link has been sent to your email.',
    ...(!emailSent ? { devLink: magicLink } : {}),
  });
};
