// API: POST /api/portal/leads/[id]/accept-bid — seller accepts a partner's bid
// This assigns the lead to the partner and rejects all other bids.
// Body: { bidId }

import { getSessionUser } from '../../../../src/lib/auth';
import { json, handleCORS } from '../../../_lib/utils';

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const db = context.env.DB as D1Database;
  const secret = context.env.AUTH_SECRET as string;
  const siteUrl = (context.env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
  if (!user) return json({ error: 'Not authenticated' }, 401);

  const leadId = context.params.id;
  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const bidId = String(body.bidId || '');
  if (!bidId) return json({ error: 'bidId is required' }, 400);

  const bid = await db.prepare(
    `SELECT * FROM bids WHERE id = ? AND lead_id = ? AND status = 'pending'`
  ).bind(bidId, leadId).first<Record<string, unknown>>();
  if (!bid) return json({ error: 'Bid not found or no longer available' }, 404);

  // Accept the winning bid
  await db.prepare(
    `UPDATE bids SET status = 'accepted', updated_at = datetime('now') WHERE id = ?`
  ).bind(bidId).run();

  // Reject all other bids on this lead
  await db.prepare(
    `UPDATE bids SET status = 'rejected', updated_at = datetime('now') WHERE lead_id = ? AND id != ? AND status = 'pending'`
  ).bind(leadId, bidId).run();

  // Assign the lead to the partner
  await db.prepare(
    `UPDATE leads SET assigned_partner_id = ?, accepted_bid_id = ?, status = 'assigned', updated_at = datetime('now') WHERE id = ?`
  ).bind(bid.partner_id, bidId, leadId).run();

  return json({ ok: true, status: 'assigned', partnerId: bid.partner_id });
};
