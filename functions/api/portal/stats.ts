// API: GET /api/portal/stats — dashboard overview stats for the logged-in partner
import { requirePartner, parseBody } from './_helpers';
import { json } from '../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;

  // Count leads by status for this partner
  const newLeads = await db.prepare(
    `SELECT COUNT(*) as c FROM leads WHERE status = 'new' AND (assigned_partner_id IS NULL OR assigned_partner_id = ?)`
  ).bind(partnerId).first<{ c: number }>();

  const biddingLeads = await db.prepare(
    `SELECT COUNT(*) as c FROM leads l JOIN bids b ON b.lead_id = l.id WHERE b.partner_id = ? AND b.status = 'pending'`
  ).bind(partnerId).first<{ c: number }>();

  const wonLeads = await db.prepare(
    `SELECT COUNT(*) as c FROM leads WHERE assigned_partner_id = ? AND status IN ('assigned','completed')`
  ).bind(partnerId).first<{ c: number }>();

  const completedLeads = await db.prepare(
    `SELECT COUNT(*) as c FROM leads WHERE assigned_partner_id = ? AND status = 'completed'`
  ).bind(partnerId).first<{ c: number }>();

  const totalBids = await db.prepare(
    `SELECT COUNT(*) as c FROM bids WHERE partner_id = ?`
  ).bind(partnerId).first<{ c: number }>();

  const activeAds = await db.prepare(
    `SELECT COUNT(*) as c FROM partner_ads WHERE partner_id = ? AND status = 'active'`
  ).bind(partnerId).first<{ c: number }>();

  const zonesLocked = await db.prepare(
    `SELECT COUNT(*) as c FROM zones WHERE partner_id = ? AND locked_until IS NOT NULL`
  ).bind(partnerId).first<{ c: number }>();

  const unreadMessages = await db.prepare(
    `SELECT COUNT(*) as c FROM messages m JOIN leads l ON m.lead_id = l.id WHERE l.assigned_partner_id = ? AND m.sender_role = 'seller' AND m.read_at IS NULL`
  ).bind(partnerId).first<{ c: number }>();

  // Recent leads (5 latest available)
  const recentLeads = await db.prepare(
    `SELECT id, name, country, scrap_class, weight_kg, status, created_at FROM leads WHERE status = 'new' ORDER BY created_at DESC LIMIT 5`
  ).all();

  return json({
    stats: {
      newLeads: newLeads?.c || 0,
      biddingLeads: biddingLeads?.c || 0,
      wonLeads: wonLeads?.c || 0,
      completedLeads: completedLeads?.c || 0,
      totalBids: totalBids?.c || 0,
      activeAds: activeAds?.c || 0,
      zonesLocked: zonesLocked?.c || 0,
      unreadMessages: unreadMessages?.c || 0,
    },
    recentLeads: recentLeads.results,
  });
};
