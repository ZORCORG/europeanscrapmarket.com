// Shared helpers for portal API endpoints.
// Portal = partner (scrap yard) area — requires partner or admin role.

import { getSessionUser } from '../../../src/lib/auth';
import { json, handleCORS } from '../../_lib/utils';

export interface PortalContext {
  request: Request;
  env: Record<string, unknown>;
  db: D1Database;
  params: Record<string, string>;
}

export async function requirePartner(context: { request: Request; env: Record<string, unknown> }) {
  const cors = handleCORS(context.request);
  if (cors) return { cors, user: null } as const;

  const db = context.env.DB as D1Database;
  const secret = context.env.AUTH_SECRET as string;
  const siteUrl = (context.env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
  if (!user) return { cors: null, user: null, error: json({ error: 'Not authenticated' }, 401) } as const;
  if (user.role !== 'partner' && user.role !== 'admin') {
    return { cors: null, user: null, error: json({ error: 'Partner access required' }, 403) } as const;
  }
  return { cors: null, user, error: null } as const;
}

/** Parse JSON body safely. */
export async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Generate a lead display ID for UI (shortened). */
export function shortId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}
