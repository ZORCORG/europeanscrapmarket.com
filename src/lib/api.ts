// Client-side API helpers for data operations

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  city?: string;
  scrap_class: string;
  weight_kg?: number;
  description: string;
  photos_count: number;
  status: string;
  created_at: string;
}

export interface Listing {
  id: string;
  title: string;
  scrap_class: string;
  country: string;
  city?: string;
  weight_kg?: number;
  price_eur?: number;
  description: string;
  photos_count: number;
  created_at: string;
}

export interface PartnerApplication {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  website?: string;
  yards_count: number;
  metals?: string;
  message?: string;
  status: string;
  created_at: string;
}

/** Submit a scrap lead. */
export async function submitLead(data: Record<string, unknown>): Promise<{ ok: boolean; error?: string; message?: string }> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

/** Submit a partner application. */
export async function submitPartner(data: Record<string, unknown>): Promise<{ ok: boolean; error?: string; message?: string }> {
  const res = await fetch('/api/partners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

/** Fetch marketplace listings. */
export async function fetchListings(country?: string): Promise<Listing[]> {
  const params = country ? `?country=${encodeURIComponent(country)}` : '';
  const res = await fetch(`/api/listings${params}`);
  const data = await res.json();
  return data.listings ?? [];
}

/** Admin: fetch dashboard stats. */
export async function fetchAdminStats(): Promise<{
  stats: Record<string, number>;
  leadsByCountry: { country: string; count: number }[];
  recentLeads: Lead[];
}> {
  const res = await fetch('/api/admin/stats');
  return res.json();
}

/** Admin: fetch leads. */
export async function fetchLeads(status = 'new'): Promise<Lead[]> {
  const res = await fetch(`/api/leads?status=${status}`);
  const data = await res.json();
  return data.leads ?? [];
}

/** Admin: update lead status. */
export async function updateLeadStatus(id: string, status: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/leads?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

/** Admin: fetch partner applications. */
export async function fetchPartners(status = 'pending'): Promise<PartnerApplication[]> {
  const res = await fetch(`/api/partners?status=${status}`);
  const data = await res.json();
  return data.applications ?? [];
}

/** Admin: update partner application status. */
export async function updatePartnerStatus(id: string, status: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/partners?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

/** Admin: fetch users. */
export async function fetchUsers(): Promise<Record<string, unknown>[]> {
  const res = await fetch('/api/admin/users');
  const data = await res.json();
  return data.users ?? [];
}

/** Admin: update user role/status. */
export async function updateUser(id: string, data: { role?: string; status?: string }): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/users?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
