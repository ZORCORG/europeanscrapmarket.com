// Better Auth server instance — created per request from env bindings.
// Used by the catch-all handler at functions/api/auth/[...path].ts
// and by other API endpoints that need session validation.

import { betterAuth } from 'better-auth';

export interface CreateAuthOpts {
  db: D1Database;
  secret: string;
  siteUrl: string;
  emailWorkerUrl: string;
  emailWorkerKey: string;
}

export function createAuth(opts: CreateAuthOpts) {
  return betterAuth({
    // Better Auth's Kysely adapter auto-detects D1 (has batch/exec/prepare)
    // and creates a D1SqliteDialect internally — no extra deps needed.
    database: opts.db,
    secret: opts.secret,
    baseURL: `${opts.siteUrl}/api/auth`,
    trustedOrigins: [opts.siteUrl, 'https://europeanscrapmarket.pages.dev'],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: false,
    },
    magicLink: {
      enabled: true,
      sendMagicLink: async ({ email, url }) => {
        const html = [
          `<p>Click <a href="${url}">here</a> to sign in to European Scrap Market.</p>`,
          `<p>This link expires in 15 minutes. If you did not request it, ignore this email.</p>`,
          `<p style="color:#999;font-size:12px;margin-top:24px">European Scrap Market — europeanscrapmarket.com</p>`,
        ].join('');
        try {
          await fetch(opts.emailWorkerUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Email-Worker-Key': opts.emailWorkerKey,
            },
            body: JSON.stringify({
              to: email,
              subject: 'Your sign-in link — European Scrap Market',
              html,
            }),
          });
        } catch (err) {
          console.error('Email worker call failed:', err);
        }
      },
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'buyer',
          input: false,
        },
        company: {
          type: 'string',
          required: false,
          input: true,
        },
        phone: {
          type: 'string',
          required: false,
          input: true,
        },
        country: {
          type: 'string',
          required: false,
          input: true,
        },
        status: {
          type: 'string',
          required: false,
          defaultValue: 'active',
          input: false,
        },
      },
    },
  });
}

/** Helper to get the authenticated user from a request, or null. */
export async function getSessionUser(
  db: D1Database,
  secret: string,
  siteUrl: string,
  request: Request,
): Promise<{
  id: string; email: string; name: string; role: string;
  company?: string; phone?: string; country?: string; status?: string;
} | null> {
  const auth = createAuth({
    db,
    secret,
    siteUrl,
    emailWorkerUrl: '',
    emailWorkerKey: '',
  });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  const u = session.user as Record<string, unknown>;
  return {
    id: u.id as string,
    email: u.email as string,
    name: u.name as string,
    role: (u.role as string) || 'buyer',
    company: u.company as string | undefined,
    phone: u.phone as string | undefined,
    country: u.country as string | undefined,
    status: u.status as string | undefined,
  };
}
