import type { Service } from './types';
export const rp = (n: number | null | undefined) => (n == null ? '-' : 'Rp ' + Math.round(n).toLocaleString('id-ID'));
export const PM_LABEL: Record<string, string> = { HOURLY: 'Per Jam', DAILY: 'Harian', PROJECT: 'Per Proyek' };
export const PM_UNIT: Record<string, string> = { HOURLY: 'jam', DAILY: 'hari', PROJECT: 'proyek' };
export const MODE_LABEL: Record<string, string> = { ONSITE: 'On-Site (Datang ke Lokasi)', REMOTE: 'Remote / Online', BOTH: 'Keduanya (On-Site & Remote)' };
export const MODE_SHORT: Record<string, string> = { ONSITE: 'On-Site', REMOTE: 'Remote', BOTH: 'On-Site & Remote' };
export const warrantyLabel = (d: number) => (d <= 0 ? 'Tanpa Garansi' : `Garansi ${d} Hari`);
export const dateID = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export function tiers(s: Service) {
  const a: { pm: 'HOURLY' | 'DAILY' | 'PROJECT'; price: number }[] = [];
  if (s.price_hourly) a.push({ pm: 'HOURLY', price: s.price_hourly });
  if (s.price_daily) a.push({ pm: 'DAILY', price: s.price_daily });
  if (s.price_project) a.push({ pm: 'PROJECT', price: s.price_project });
  return a;
}
export function svgAvatar(name: string, color = '#2A8C78') {
  const ini = name.split(' ').slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${color}"/><text x="100" y="125" font-size="80" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle">${ini}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
export function waLink(number: string, text: string) {
  let n = (number || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
