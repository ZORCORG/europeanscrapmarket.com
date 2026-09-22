// Better Auth client — used in frontend scripts.
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: '/api/auth',
});

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
    const { data, error } = await authClient.getSession();
    if (error || !data) return null;
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: (data.user as Record<string, unknown>).role as string,
      company: (data.user as Record<string, unknown>).company as string | undefined,
      phone: (data.user as Record<string, unknown>).phone as string | undefined,
      country: (data.user as Record<string, unknown>).country as string | undefined,
      status: (data.user as Record<string, unknown>).status as string | undefined,
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
  await authClient.signOut();
  window.location.href = '/';
}
