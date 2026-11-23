'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { list, profileMap } from '@/lib/db';
import { rp } from '@/lib/format';
import type { Order, Profile } from '@/lib/types';
import { RequireAuth } from '@/components/Gate';
import { STATUS_LABEL } from '@/components/OrderStatus';

export default function Pesanan() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Order[]>([]); const [pm, setPm] = useState<Record<string, Profile>>({}); const [tab, setTab] = useState<'buyer' | 'provider'>('buyer');
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [b, p, m] = await Promise.all([list<Order>('orders', { buyer_id: user.id }), list<Order>('orders', { provider_id: user.id }), profileMap()]);
      setPm(m); setRows(tab === 'buyer' ? b : p);
    })().catch(console.error);
  }, [user, tab]);
  return (
    <RequireAuth>
      <div className="pt-5">
        <h1 className="text-2xl font-extrabold">Pesanan</h1>
        <div className="mt-4 grid grid-cols-2 rounded-xl border border-line p-1 text-sm">
          {(['buyer', 'provider'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-lg py-2 font-semibold ${tab === t ? 'bg-primary' : 'text-white/60'}`}>{t === 'buyer' ? 'Sebagai Pembeli' : 'Sebagai Penyedia'}</button>)}
        </div>
        <div className="mt-4 space-y-3">
          {rows.map((o) => (
            <Link key={o.id} href={`/pesanan/${o.id}`} className="card block hover:border-primary transition">
              <span className="chip !text-gold">{STATUS_LABEL[o.status]}</span>
              <h3 className="mt-2 font-bold">{o.title}</h3>
              <p className="mt-1 text-sm text-white/70">{rp(o.agreed_price)} · dengan {pm[tab === 'buyer' ? o.provider_id : o.buyer_id]?.full_name}</p>
            </Link>
          ))}
          {!rows.length && <div className="card text-center text-sm text-white/60">Belum ada pesanan. Mulai dari <Link href="/cari" className="text-gold underline">Cari Jasa</Link> atau terima penawaran di <Link href="/permintaan" className="text-gold underline">Permintaan</Link>.</div>}
        </div>
      </div>
    </RequireAuth>
  );
}
