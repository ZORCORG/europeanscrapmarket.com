// API: GET  /api/portal/leads/[id]/messages — get chat messages
// API: POST /api/portal/leads/[id]/messages — send a message

import { requirePartner, parseBody } from '../../_helpers';
import { getSessionUser } from '../../../../../src/lib/auth';
import { json, handleCORS, randomToken } from '../../../../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const leadId = context.params.id;

  // Verify partner has access (assigned or has a bid)
  const lead = await db.prepare('SELECT assigned_partner_id FROM leads WHERE id = ?').bind(leadId).first<Record<string, unknown>>();
  if (!lead) return json({ error: 'Lead not found' }, 404);

  const isAssigned = lead.assigned_partner_id === user!.id;
  if (!isAssigned && user!.role !== 'admin') {
    const hasBid = await db.prepare(
      `SELECT 1 FROM bids WHERE lead_id = ? AND partner_id = ? AND status IN ('pending','accepted')`
    ).bind(leadId, user!.id).first();
    if (!hasBid) return json({ error: 'Access denied' }, 403);
  }

  const messages = await db.prepare(
    `SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC`
  ).bind(leadId).all();

  return json({ messages: messages.results });
};

export const onRequestPost: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const leadId = context.params.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const message = String(body.message || '').trim();
  if (!message) return json({ error: 'Message is required' }, 400);
  if (message.length > 2000) return json({ error: 'Message too long (max 2000 chars)' }, 400);

  // Verify partner has access
  const lead = await db.prepare('SELECT assigned_partner_id FROM leads WHERE id = ?').bind(leadId).first<Record<string, unknown>>();
  if (!lead) return json({ error: 'Lead not found' }, 404);

  const isAssigned = lead.assigned_partner_id === user!.id;
  if (!isAssigned && user!.role !== 'admin') {
    const hasBid = await db.prepare(
      `SELECT 1 FROM bids WHERE lead_id = ? AND partner_id = ? AND status IN ('pending','accepted')`
    ).bind(leadId, user!.id).first();
    if (!hasBid) return json({ error: 'Access denied' }, 403);
  }

  const msgId = randomToken(16);
  await db.prepare(
    `INSERT INTO messages (id, lead_id, sender_id, sender_role, message)
     VALUES (?, ?, ?, 'partner', ?)`
  ).bind(msgId, leadId, user!.id, message).run();

  return json({ ok: true, messageId: msgId }, 201);
};
