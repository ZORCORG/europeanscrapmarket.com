// Shared auth utilities for Pages Functions
// Uses Web Crypto API (available in Workers) — no external deps.

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Sign a JWT with HMAC-SHA256. */
export async function signJWT(payload: Record<string, unknown>, secret: string, ttlSeconds = 7 * 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const data = `${b64(header)}.${b64(fullPayload)}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return `${data}.${btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
}

/** Verify a JWT signature. Returns payload or null. */
export async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sigBytes = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${parts[0]}.${parts[1]}`));
  if (!valid) return null;
  const payload = JSON.parse(dec.decode(Uint8Array.from(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}

/** Generate a cryptographically random token. */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
}

/** Hash a string with SHA-256 (for token storage). */
export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(token));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

/** Get session secret from environment. */
export function getSecret(env: Record<string, unknown>): string {
  const s = env.AUTH_SECRET as string | undefined;
  if (!s) throw new Error('AUTH_SECRET is not set');
  return s;
}

/** Parse cookies from a request header. */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  }
  return out;
}

/** Set session cookie. */
export function setSessionCookie(token: string, maxAge = 7 * 86400): string {
  return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

/** Clear session cookie. */
export function clearSessionCookie(): string {
  return `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Get the authenticated user from a request, or null. */
export async function getUser(req: Request, env: Record<string, unknown>): Promise<{ id: string; email: string; name: string; role: string } | null> {
  const cookies = parseCookies(req.headers.get('Cookie'));
  const token = cookies['session'];
  if (!token) return null;
  const secret = getSecret(env);
  const payload = await verifyJWT(token, secret);
  if (!payload || !payload.sid) return null;

  const db = env.DB as D1Database;
  const tokenHash = await hashToken(token);
  const session = await db.prepare('SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > datetime(\'now\')').bind(tokenHash).first();
  if (!session) return null;

  const user = await db.prepare('SELECT id, email, name, role FROM users WHERE id = ? AND status = \'active\'').bind(session.user_id as string).first();
  return user as { id: string; email: string; name: string; role: string } | null;
}

/** JSON response helper. */
export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'same-origin', ...extraHeaders },
  });
}

/** CORS preflight handler. */
export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'same-origin',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  return null;
}
