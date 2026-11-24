import Link from 'next/link';
import type { Profile, Service } from '@/lib/types';
import { MODE_SHORT, PM_LABEL, PM_UNIT, rp, tiers, warrantyLabel } from '@/lib/format';
import { Avatar, NewBadge, Stars } from './Badges';

export default function ServiceCard({ s, p }: { s: Service; p?: Profile }) {
  return (
    <Link href={`/cari/${s.id}`} className="card block hover:border-primary transition">
      <div className="flex gap-2 flex-wrap text-[11px]">
        <span className="chip">{s.items?.[0] || s.category}{(s.items?.length || 0) > 1 ? ` +${s.items.length - 1}` : ''}</span>
        <span className="chip">{MODE_SHORT[s.mode]}{s.mode !== 'REMOTE' && s.city ? ` · ${s.city}` : ''}</span>
        <span className="chip">🛡 {warrantyLabel(s.warranty_days)}</span>
      </div>
      <h3 className="mt-2 font-bold leading-snug">{s.title}</h3>
      <div className="mt-2 space-y-0.5">
        {tiers(s).map((t) => <p key={t.pm} className="text-sm"><span className="text-gold font-semibold">{rp(t.price)}</span> <span className="text-white/60">/ {PM_UNIT[t.pm]}</span> <span className="text-[11px] text-white/40">({PM_LABEL[t.pm]})</span></p>)}
      </div>
      {p && (
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <Avatar p={p} size={28} />
          <span className="text-sm">{p.full_name}</span><NewBadge p={p} /><span className="ml-auto"><Stars p={p} /></span>
        </div>
      )}
    </Link>
  );
}
