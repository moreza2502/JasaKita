import { getSupabase, isDemo } from './supabase';
import { seed } from './seed';
import type { Order, Profile, Service } from './types';

export type Tbl = 'profiles' | 'contacts' | 'services' | 'requests' | 'bids' | 'orders' | 'reports' | 'mod_logs' | 'users';
const K = (t: string) => 'jk_' + t;
function ensure() {
  if (localStorage.getItem('jk_seed') !== 'v1') {
    const s: any = seed();
    Object.keys(s).forEach((t) => localStorage.setItem(K(t), JSON.stringify(s[t])));
    localStorage.setItem('jk_seed', 'v1');
  }
}
function rd(t: Tbl): any[] { if (typeof window === 'undefined') return []; ensure(); return JSON.parse(localStorage.getItem(K(t)) || '[]'); }
function wr(t: Tbl, rows: any[]) { localStorage.setItem(K(t), JSON.stringify(rows)); }
const uid = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
export const resetDemo = () => { Object.keys(localStorage).filter((k) => k.startsWith('jk_')).forEach((k) => localStorage.removeItem(k)); };

export async function list<T = any>(t: Tbl, eq: Record<string, any> = {}): Promise<T[]> {
  if (isDemo) return rd(t).filter((r) => Object.keys(eq).every((k) => r[k] === eq[k])).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  let q: any = getSupabase().from(t).select('*');
  Object.keys(eq).forEach((k) => { q = q.eq(k, eq[k]); });
  if (t !== 'contacts') q = q.order('created_at', { ascending: false });
  const { data, error } = await q; if (error) throw new Error(error.message); return data || [];
}
export async function get<T = any>(t: Tbl, id: string): Promise<T | null> {
  if (isDemo) return rd(t).find((r) => r.id === id) || null;
  const { data, error } = await getSupabase().from(t).select('*').eq('id', id).maybeSingle(); if (error) throw new Error(error.message); return data as T;
}
export async function insert<T = any>(t: Tbl, row: any): Promise<T> {
  if (isDemo) { const r = { id: uid(), created_at: new Date().toISOString(), ...row }; wr(t, [...rd(t), r]); return r as T; }
  const { data, error } = await getSupabase().from(t).insert(row).select().single(); if (error) throw new Error(error.message); return data as T;
}
export async function patch(t: Tbl, id: string, p: any) {
  if (isDemo) { wr(t, rd(t).map((r) => (r.id === id ? { ...r, ...p } : r))); return; }
  const { error } = await getSupabase().from(t).update(p).eq('id', id); if (error) throw new Error(error.message);
}
export async function upsertContact(id: string, whatsapp: string) {
  if (isDemo) { const rows = rd('contacts').filter((r) => r.id !== id); wr('contacts', [...rows, { id, whatsapp }]); return; }
  const { error } = await getSupabase().from('contacts').upsert({ id, whatsapp }); if (error) throw new Error(error.message);
}
export async function profileMap(): Promise<Record<string, Profile>> {
  const m: Record<string, Profile> = {}; (await list<Profile>('profiles')).forEach((p) => (m[p.id] = p)); return m;
}
export async function suspendUser(id: string) {
  await patch('profiles', id, { status: 'SUSPENDED' });
  for (const s of await list<Service>('services', { provider_id: id })) await patch('services', s.id, { is_active: false });
}
export async function restoreUser(id: string) {
  await patch('profiles', id, { status: 'ACTIVE' });
  for (const s of await list<Service>('services', { provider_id: id })) await patch('services', s.id, { is_active: true });
}
// Admin memvalidasi laporan; >= 3 laporan valid => SUSPENDED otomatis
export async function validateReport(reportId: string, targetId: string) {
  await patch('reports', reportId, { status: 'VALID' });
  const valid = (await list<any>('reports', { target_id: targetId })).filter((r) => r.status === 'VALID');
  if (valid.length >= 3) await suspendUser(targetId);
  return valid.length;
}
// Tutup pesanan + statistik penyedia (di Supabase statistik dihitung oleh trigger SQL)
export async function closeOrder(o: Order, rating: number, review: string) {
  await patch('orders', o.id, { status: 'CLOSED', rating, review });
  if (isDemo) {
    const p = await get<Profile>('profiles', o.provider_id);
    if (p) await patch('profiles', p.id, { completed_orders: p.completed_orders + 1, rating_sum: p.rating_sum + rating, rating_count: p.rating_count + 1 });
  }
}
