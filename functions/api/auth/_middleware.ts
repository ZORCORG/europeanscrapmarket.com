// Catch-all handler for Better Auth — handles all /api/auth/* routes.
// Better Auth's handler receives the raw request and routes internally
// to sign-in/magic-link, sign-in/email, sign-up/email, get-session,
// sign-out, list-sessions, etc.

import { createAuth } from '../../../src/lib/auth';

export const onRequest: PagesFunction = async (context) => {
  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'AUTH_SECRET not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const emailWorkerUrl = (env.EMAIL_WORKER_URL as string) || 'https://esm-email-worker.zebulon-d11.workers.dev';
  const emailWorkerKey = (env.EMAIL_WORKER_KEY as string) || '';

  const auth = createAuth({ db, secret, siteUrl, emailWorkerUrl, emailWorkerKey });
  return auth.handler(context.request);
};
