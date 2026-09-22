// API: POST /api/partners — submit a partner application
// API: GET  /api/partners — list applications (admin only)

import { getUser, json, handleCORS } from '../_lib/auth';

export const onRequestPost: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;

  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const companyName = String(body.companyName || '').trim();
  const contactName = String(body.contactName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const country = String(body.country || '').trim();

  if (!companyName || !contactName || !email || !phone || !country) {
    return json({ error: 'companyName, contactName, email, phone, and country are required' }, 400);
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return json({ error: 'Valid email is required' }, 400);

  await db.prepare(
    `INSERT INTO partner_applications (company_name, contact_name, email, phone, country, city, website, yards_count, metals, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    companyName, contactName, email, phone, country,
    String(body.city || '').trim() || null,
    String(body.website || '').trim() || null,
    Number(body.yardsCount || 1),
    String(body.metals || '').trim() || null,
    String(body.message || '').trim() || null,
  ).run();

  return json({ ok: true, message: 'Your application has been received. We will contact you within 2 business days.' }, 201);
};

export const onRequestGet: PagesFunction = async (context) => {
  const cors = handleCORS(context.request);
  if (cors) return cors;

  const env = context.env as Record<string, unknown>;
  const db = env.DB as D1Database;
  const user = await getUser(context.request, env);
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const url = new URL(context.request.url);
  const status = url.searchParams.get('status') || 'pending';
  const apps = await db.prepare(
    `SELECT * FROM partner_applications WHERE status = ? ORDER BY created_at DESC LIMIT 100`
  ).bind(status).all();

  return json({ applications: apps.results });
};
