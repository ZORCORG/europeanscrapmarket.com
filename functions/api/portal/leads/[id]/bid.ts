// API: POST /api/portal/leads/[id]/bid — place or update a bid on a lead
// Body: { priceEur?, pricePerKg?, message?, priority?, action? }
// action: 'place' (default) | 'withdraw'

import { requirePartner, parseBody } from '../../_helpers';
import { json } from '../../../../_lib/utils';
import { randomToken } from '../../../../_lib/utils';

export const onRequestPost: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const leadId = context.params.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  // Verify lead exists and is available for bidding
  const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(leadId).first<Record<string, unknown>>();
  if (!lead) return json({ error: 'Lead not found' }, 404);
  if (lead.status !== 'new' && lead.status !== 'bidding') {
    return json({ error: 'This lead is no longer accepting bids' }, 400);
  }

  const action = String(body.action || 'place');

  // Check for existing bid by this partner
  const existing = await db.prepare(
    `SELECT * FROM bids WHERE lead_id = ? AND partner_id = ? AND status = 'pending'`
  ).bind(leadId, partnerId).first<Record<string, unknown>>();

  if (action === 'withdraw') {
    if (existing) {
      await db.prepare(
        `UPDATE bids SET status = 'withdrawn', updated_at = datetime('now') WHERE id = ?`
      ).bind(existing.id).run();
    }
    return json({ ok: true, status: 'withdrawn' });
  }

  // Place or update bid
  const priceEur = body.priceEur ? Number(body.priceEur) : null;
  const pricePerKg = body.pricePerKg ? Number(body.pricePerKg) : null;
  const message = String(body.message || '').trim() || null;
  const priority = body.priority ? 1 : 0;

  if (!priceEur && !pricePerKg) {
    return json({ error: 'A price (total or per kg) is required' }, 400);
  }

  if (existing) {
    await db.prepare(
      `UPDATE bids SET price_eur = ?, price_per_kg = ?, message = ?, priority = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(priceEur, pricePerKg, message, priority, existing.id).run();
    return json({ ok: true, bidId: existing.id, status: 'updated' });
  }

  const bidId = randomToken(16);
  await db.prepare(
    `INSERT INTO bids (id, lead_id, partner_id, price_eur, price_per_kg, message, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(bidId, leadId, partnerId, priceEur, pricePerKg, message, priority).run();

  // Set lead status to 'bidding' if it was 'new'
  if (lead.status === 'new') {
    await db.prepare(
      `UPDATE leads SET status = 'bidding' WHERE id = ?`
    ).bind(leadId).run();
  }

  return json({ ok: true, bidId, status: 'placed' }, 201);
};
