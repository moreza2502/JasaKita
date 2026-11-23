import type { Profile } from '@/lib/types';
import { avgRating, isNew, trustScore } from '@/lib/trust';

export function NewBadge({ p }: { p: Profile }) {
  return isNew(p) ? <span className="rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 px-2 py-0.5 text-[11px] font-semibold">⚠ Akun Baru</span> : null;
}
export function TrustBadge({ p }: { p: Profile }) {
  const s = trustScore(p);
  const c = s >= 70 ? 'text-emerald-300 border-emerald-500/40' : s >= 40 ? 'text-gold border-gold/40' : 'text-red-300 border-red-500/40';
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c}`}>🛡 Trust {s}/100</span>;
}
export function Stars({ p }: { p: Profile }) {
  const r = avgRating(p);
  return <span className="text-xs text-white/70">{r ? <><span className="text-gold">★</span> {r.toFixed(1)} ({p.rating_count})</> : 'Belum ada ulasan'}</span>;
}
export function Avatar({ p, size = 40 }: { p?: Profile; size?: number }) {
  return p?.avatar_url
    ? <img src={p.avatar_url} alt="" style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
    : <span style={{ width: size, height: size }} className="grid place-items-center rounded-full bg-bg border border-line shrink-0">👤</span>;
}
