// API: GET /api/my-leads — fetch the current user's leads with bids
// Sellers use this to track their submissions and accept/reject bids.

import { getSessionUser } from '../../src/lib/auth';
import { json, handleCORS } from '../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
  if (!user) return json({ error: 'Not authenticated' }, 401);

  // Fetch leads for this user (matched by user_id or email)
  const leads = await db.prepare(
    `SELECT * FROM leads WHERE user_id = ? OR email = ? ORDER BY created_at DESC`
  ).bind(user.id, user.email).all();

  // Fetch bids for these leads
  const leadIds = leads.results.map((l: Record<string, unknown>) => l.id);
  let bidsByLead: Record<string, unknown[]> = {};

  if (leadIds.length > 0) {
    const placeholders = leadIds.map(() => '?').join(',');
    const bids = await db.prepare(
      `SELECT b.*, u.name as partner_name, u.company as partner_company
       FROM bids b
       JOIN "user" u ON b.partner_id = u.id
       WHERE b.lead_id IN (${placeholders})
       ORDER BY b.created_at ASC`
    ).bind(...leadIds).all();

    for (const bid of bids.results) {
      const lid = (bid as Record<string, unknown>).lead_id as string;
      if (!bidsByLead[lid]) bidsByLead[lid] = [];
      bidsByLead[lid].push(bid);
    }
  }

  // Attach bids to each lead
  const leadsWithBids = leads.results.map((lead: Record<string, unknown>) => ({
    ...lead,
    bids: bidsByLead[lead.id as string] || [],
  }));

  return json({ leads: leadsWithBids });
};
