import type { Profile } from './types';
const isEmail = (s?: string | null) => !!s && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

// Bobot: foto 20, nama+bio 15, domisili 20, WhatsApp 20, email 15, sosial 10.
// Wajib (req): foto, domisili, WhatsApp, email. Boleh menerbitkan jika semua wajib terisi DAN skor >= 80.
// email === undefined berarti "anggap ada" (dipakai untuk menghitung Trust Score akun orang lain).
export function completeness(p: Profile, email?: string | null) {
  const items = [
    { key: 'photo', label: 'Foto profil asli', w: 20, req: true, ok: !!p.avatar_url },
    { key: 'name', label: 'Nama lengkap & bio singkat', w: 15, req: false, ok: !!p.full_name?.trim() && (p.bio || '').trim().length >= 10 },
    { key: 'loc', label: 'Alamat domisili (Provinsi, Kota, Kecamatan)', w: 20, req: true, ok: !!(p.province && p.city && p.district) },
    { key: 'wa', label: 'WhatsApp aktif (terkonfirmasi)', w: 20, req: true, ok: !!p.wa_verified },
    { key: 'email', label: 'Alamat email', w: 15, req: true, ok: email === undefined ? true : isEmail(email) },
    { key: 'social', label: 'Link sosial media / portofolio', w: 10, req: false, ok: /^https?:\/\/.+\..+/.test(p.social_url || '') },
  ];
  const pct = items.filter((i) => i.ok).reduce((a, i) => a + i.w, 0);
  const missing = items.filter((i) => i.req && !i.ok);
  return { items, pct, missing, canPublish: pct >= 80 && missing.length === 0 };
}
export const ageDays = (p: Profile) => Math.floor((Date.now() - new Date(p.created_at).getTime()) / 864e5);
export const isNew = (p: Profile) => ageDays(p) < 30;
export const avgRating = (p: Profile) => (p.rating_count ? p.rating_sum / p.rating_count : 0);
// Trust Score 0-100: kelengkapan profil (30) + usia akun (20) + pesanan selesai (25) + rating bintang (25)
export function trustScore(p: Profile) {
  const s = (completeness(p).pct / 100) * 30 + Math.min(ageDays(p) / 180, 1) * 20 + Math.min(p.completed_orders / 10, 1) * 25 + (avgRating(p) / 5) * 25;
  return Math.round(s);
}
