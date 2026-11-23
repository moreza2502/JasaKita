import type { Profile } from './types';
export function completeness(p: Profile) {
  const items = [
    { label: 'Foto profil asli', ok: !!p.avatar_url },
    { label: 'Nama lengkap & bio singkat', ok: !!p.full_name?.trim() && (p.bio || '').trim().length >= 10 },
    { label: 'Domisili (Provinsi, Kota, Kecamatan)', ok: !!(p.province && p.city && p.district) },
    { label: 'WhatsApp aktif (terkonfirmasi)', ok: !!p.wa_verified },
    { label: 'Link sosial media / portofolio', ok: /^https?:\/\/.+\..+/.test(p.social_url || '') },
  ];
  return { items, pct: items.filter((i) => i.ok).length * 20 };
}
export const ageDays = (p: Profile) => Math.floor((Date.now() - new Date(p.created_at).getTime()) / 864e5);
export const isNew = (p: Profile) => ageDays(p) < 30;
export const avgRating = (p: Profile) => (p.rating_count ? p.rating_sum / p.rating_count : 0);
// Trust Score 0-100: kelengkapan profil (30) + usia akun (20) + pesanan selesai (25) + rating bintang (25)
export function trustScore(p: Profile) {
  const s = (completeness(p).pct / 100) * 30 + Math.min(ageDays(p) / 180, 1) * 20 + Math.min(p.completed_orders / 10, 1) * 25 + (avgRating(p) / 5) * 25;
  return Math.round(s);
}
