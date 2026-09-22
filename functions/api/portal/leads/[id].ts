// API: GET /api/portal/leads/[id] — get a single lead with its bids and messages
// API: PUT /api/portal/leads/[id] — update lead status (accept/complete/archive)

import { requirePartner, parseBody } from './_helpers';
import { json } from '../../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const leadId = context.params.id;

  const lead = await db.prepare(
    `SELECT * FROM leads WHERE id = ?`
  ).bind(leadId).first();

  if (!lead) return json({ error: 'Lead not found' }, 404);

  // Get all bids for this lead
  const bids = await db.prepare(
    `SELECT b.*, u.name as partner_name, u.company as partner_company, u.role
     FROM bids b JOIN "user" u ON u.id = b.partner_id
     WHERE b.lead_id = ? ORDER BY b.priority DESC, b.created_at ASC`
  ).bind(leadId).all();

  // Get messages — only if this partner has been assigned or has an accepted bid
  const isAssigned = (lead as Record<string, unknown>).assigned_partner_id === user!.id;
  const hasBid = bids.results.some((b: Record<string, unknown>) => b.partner_id === user!.id);

  let messages: { results: unknown[] } = { results: [] };
  if (isAssigned || hasBid || user!.role === 'admin') {
    messages = await db.prepare(
      `SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC`
    ).bind(leadId).all();

    // Mark seller messages as read for this partner
    if (isAssigned) {
      await db.prepare(
        `UPDATE messages SET read_at = datetime('now') WHERE lead_id = ? AND sender_role = 'seller' AND read_at IS NULL`
      ).bind(leadId).run();
    }
  }

  // Determine which contact details to show
  const showContact = isAssigned || user!.role === 'admin';

  return json({
    lead: {
      ...lead,
      // Mask seller contact if not assigned
      email: showContact ? (lead as Record<string, unknown>).email : null,
      phone: showContact ? (lead as Record<string, unknown>).phone : null,
    },
    bids: bids.results,
    messages: messages.results,
    canBid: (lead as Record<string, unknown>).status === 'new' || (lead as Record<string, unknown>).status === 'bidding',
    isAssigned,
    hasBid,
  });
};

export const onRequestPut: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const leadId = context.params.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const action = String(body.action || '');
  const partnerId = user!.id;

  // Verify this partner is assigned to the lead
  const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(leadId).first<Record<string, unknown>>();
  if (!lead) return json({ error: 'Lead not found' }, 404);

  if (lead.assigned_partner_id !== partnerId && user!.role !== 'admin') {
    return json({ error: 'You are not assigned to this lead' }, 403);
  }

  switch (action) {
    case 'complete':
      await db.prepare(
        `UPDATE leads SET status = 'completed', updated_at = datetime('now') WHERE id = ?`
      ).bind(leadId).run();
      return json({ ok: true, status: 'completed' });

    case 'archive':
      await db.prepare(
        `UPDATE leads SET status = 'archived', updated_at = datetime('now') WHERE id = ?`
      ).bind(leadId).run();
      return json({ ok: true, status: 'archived' });

    default:
      return json({ error: 'Unknown action' }, 400);
  }
};
