// Client-side auth utilities

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'partner' | 'admin';
}

/** Check if the user is logged in. Returns the user or null. */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

/** Require authentication — redirect to /login if not signed in. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    throw new Error('Not authenticated');
  }
  return user;
}

/** Require admin role — redirect to /account if not admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    window.location.href = '/account';
    throw new Error('Admin access required');
  }
  return user;
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  await fetch('/api/auth/sign-out', { method: 'POST' });
  window.location.href = '/';
}

/** Request a magic link for the given email. */
export async function requestMagicLink(email: string): Promise<{ ok: boolean; error?: string; devLink?: string }> {
  const res = await fetch('/api/auth/sign-in/magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}
