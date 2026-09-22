// API: GET /api/auth/session
// Returns the current session user or null.

import { getUser, json, handleCORS } from '../../_lib/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  try {
    const user = await getUser(context.request, env);
    if (!user) return json({ user: null });
    return json({ user });
  } catch {
    return json({ user: null });
  }
};
