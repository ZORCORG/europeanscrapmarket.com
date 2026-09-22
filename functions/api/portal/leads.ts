// API: GET /api/portal/leads — list leads for the partner, filtered by status
// Query: ?status=new|bidding|won|completed|all  &limit=50

import { requirePartner } from './_helpers';
import { json } from '../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const url = new URL(context.request.url);
  const status = url.searchParams.get('status') || 'all';
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

  let query: string;
  let binds: unknown[];

  switch (status) {
    case 'new':
      // Available leads not yet assigned (partners can see all new leads to bid on)
      query = `SELECT id, name, country, city, scrap_class, weight_kg, description, status, created_at,
               (SELECT COUNT(*) FROM bids WHERE lead_id = leads.id) as bid_count
               FROM leads WHERE status = 'new' ORDER BY created_at DESC LIMIT ?`;
      binds = [limit];
      break;
    case 'bidding':
      query = `SELECT l.id, l.name, l.country, l.city, l.scrap_class, l.weight_kg, l.description, l.status, l.created_at,
               b.price_eur, b.price_per_kg, b.status as bid_status, b.priority, b.created_at as bid_at
               FROM leads l JOIN bids b ON b.lead_id = l.id
               WHERE b.partner_id = ? AND b.status = 'pending'
               ORDER BY b.created_at DESC LIMIT ?`;
      binds = [partnerId, limit];
      break;
    case 'won':
      query = `SELECT l.id, l.name, l.country, l.city, l.scrap_class, l.weight_kg, l.description, l.status, l.created_at
               FROM leads l WHERE l.assigned_partner_id = ? AND l.status IN ('assigned','completed')
               ORDER BY l.created_at DESC LIMIT ?`;
      binds = [partnerId, limit];
      break;
    case 'completed':
      query = `SELECT l.id, l.name, l.country, l.city, l.scrap_class, l.weight_kg, l.description, l.status, l.created_at
               FROM leads l WHERE l.assigned_partner_id = ? AND l.status = 'completed'
               ORDER BY l.created_at DESC LIMIT ?`;
      binds = [partnerId, limit];
      break;
    default:
      query = `SELECT id, name, country, city, scrap_class, weight_kg, description, status, created_at,
               (SELECT COUNT(*) FROM bids WHERE lead_id = leads.id) as bid_count,
               assigned_partner_id
               FROM leads ORDER BY created_at DESC LIMIT ?`;
      binds = [limit];
  }

  const result = await db.prepare(query).bind(...binds).all();
  return json({ leads: result.results });
};
