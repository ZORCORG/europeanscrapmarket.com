// Simple auth client — uses raw fetch to Better Auth endpoints.
// Avoids the Better Auth client library's polling/broadcast complexity
// which can hang in certain proxy environments.

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  phone?: string;
  country?: string;
  status?: string;
};

/** Get the current session user or null. */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/auth/get-session', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.user) return null;
    const u = data.user;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      company: u.company ?? undefined,
      phone: u.phone ?? undefined,
      country: u.country ?? undefined,
      status: u.status ?? undefined,
    };
  } catch {
    return null;
  }
}

/** Require auth — redirect to /login if not signed in. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    throw new Error('Not authenticated');
  }
  return user;
}

/** Require admin role. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    window.location.href = '/account';
    throw new Error('Admin access required');
  }
  return user;
}

/** Sign out and redirect home. */
export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/sign-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      credentials: 'include',
    });
  } catch {
    // ignore — redirect anyway
  }
  window.location.href = '/';
}
