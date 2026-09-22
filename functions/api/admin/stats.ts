// API: GET /api/admin/stats — dashboard statistics (admin only)

import { getSessionUser } from '../../../src/lib/auth';
import { json, handleCORS } from '../../_lib/utils';

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const secret = env.AUTH_SECRET as string;
  const siteUrl = (env.SITE_URL as string) || 'https://europeanscrapmarket.com';
  const user = await getSessionUser(db, secret, siteUrl, context.request);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const [totalLeads, newLeads, totalPartners, pendingPartners, totalUsers, activeListings] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM leads').first(),
    db.prepare('SELECT COUNT(*) as c FROM leads WHERE status = \'new\'').first(),
    db.prepare('SELECT COUNT(*) as c FROM partner_applications').first(),
    db.prepare('SELECT COUNT(*) as c FROM partner_applications WHERE status = \'pending\'').first(),
    db.prepare('SELECT COUNT(*) as c FROM "user"').first(),
    db.prepare('SELECT COUNT(*) as c FROM listings WHERE status = \'active\'').first(),
  ]);

  // Leads by country (top 5)
  const byCountry = await db.prepare(
    'SELECT country, COUNT(*) as count FROM leads GROUP BY country ORDER BY count DESC LIMIT 5'
  ).all();

  // Recent activity
  const recentLeads = await db.prepare(
    'SELECT name, country, scrap_class, created_at FROM leads ORDER BY created_at DESC LIMIT 10'
  ).all();

  return json({
    stats: {
      totalLeads: totalLeads?.c ?? 0,
      newLeads: newLeads?.c ?? 0,
      totalPartners: totalPartners?.c ?? 0,
      pendingPartners: pendingPartners?.c ?? 0,
      totalUsers: totalUsers?.c ?? 0,
      activeListings: activeListings?.c ?? 0,
    },
    leadsByCountry: byCountry.results,
    recentLeads: recentLeads.results,
  });
};
