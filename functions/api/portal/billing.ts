// API: GET /api/portal/billing — get subscription/billing info
// API: PUT /api/portal/billing — update subscription plan

import { requirePartner, parseBody } from './_helpers';
import { json } from '../_lib/utils';

const PLANS = {
  free: { priceMonthly: 0, label: 'Free', zonesCount: 0 },
  pro: { priceMonthly: 14.90, label: 'Pro', zonesCount: 0 },
  zones: { priceMonthly: 14.90, label: 'Zones', zonesCount: 0 },
};

export const onRequestGet: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;

  let sub = await db.prepare(
    `SELECT * FROM subscriptions WHERE user_id = ?`
  ).bind(partnerId).first();

  if (!sub) {
    // Auto-create free subscription
    await db.prepare(
      `INSERT INTO subscriptions (user_id, plan, price_monthly, billing_cycle)
       VALUES (?, 'free', 0, 'monthly')`
    ).bind(partnerId).run();
    sub = await db.prepare(
      `SELECT * FROM subscriptions WHERE user_id = ?`
    ).bind(partnerId).first();
  }

  // Count locked zones
  const zonesCount = await db.prepare(
    `SELECT COUNT(*) as c FROM zones WHERE partner_id = ? AND locked_until IS NOT NULL`
  ).bind(partnerId).first<{ c: number }>();

  const monthlyTotal = (zonesCount?.c || 0) * PLANS.zones.priceMonthly;

  return json({
    subscription: sub,
    zonesCount: zonesCount?.c || 0,
    monthlyTotal,
    plans: PLANS,
  });
};

export const onRequestPut: PagesFunction = async (context) => {
  const { user, error } = await requirePartner(context);
  if (error) return error;

  const db = context.env.DB as D1Database;
  const partnerId = user!.id;
  const body = await parseBody(context.request);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const plan = String(body.plan || 'free');
  const billingCycle = String(body.billingCycle || 'monthly');

  if (!PLANS[plan as keyof typeof PLANS]) return json({ error: 'Invalid plan' }, 400);
  if (!['monthly', 'quarterly'].includes(billingCycle)) return json({ error: 'Invalid billing cycle' }, 400);

  const price = PLANS[plan as keyof typeof PLANS].priceMonthly;
  const periodEnd = billingCycle === 'quarterly'
    ? new Date(Date.now() + 90 * 86400000).toISOString()
    : new Date(Date.now() + 30 * 86400000).toISOString();

  await db.prepare(
    `INSERT INTO subscriptions (user_id, plan, price_monthly, billing_cycle, current_period_end)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       plan = excluded.plan,
       price_monthly = excluded.price_monthly,
       billing_cycle = excluded.billing_cycle,
       current_period_end = excluded.current_period_end,
       updated_at = datetime('now')`
  ).bind(partnerId, plan, price, billingCycle, periodEnd).run();

  const updated = await db.prepare(
    `SELECT * FROM subscriptions WHERE user_id = ?`
  ).bind(partnerId).first();

  return json({ ok: true, subscription: updated });
};
