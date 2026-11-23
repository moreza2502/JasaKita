'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { list, profileMap } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';
import { MODE_SHORT, PM_LABEL, rp, dateID } from '@/lib/format';
import type { JobRequest, Profile } from '@/lib/types';

export default function Permintaan() {
  const [rows, setRows] = useState<JobRequest[]>([]); const [pm, setPm] = useState<Record<string, Profile>>({}); const [cat, setCat] = useState('');
  useEffect(() => { (async () => { const [r, m] = await Promise.all([list<JobRequest>('requests', { status: 'OPEN' }), profileMap()]); setRows(r); setPm(m); })().catch(console.error); }, []);
  const shown = rows.filter((r) => !cat || r.category === cat);
  return (
    <div className="pt-5">
      <h1 className="text-2xl font-extrabold">Papan Permintaan Jasa</h1>
      <p className="mt-1 text-sm text-white/60">Pembeli menulis kebutuhan, penyedia mengirim penawaran.</p>
      <Link href="/permintaan/baru" className="btn-primary mt-4 w-full">+ Pasang Permintaan</Link>
      <select className="input mt-4" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Semua kategori</option>{CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}</select>
      <div className="mt-4 space-y-3">
        {shown.map((r) => (
          <Link key={r.id} href={`/permintaan/${r.id}`} className="card block hover:border-primary transition">
            <div className="flex flex-wrap gap-2 text-[11px]"><span className="chip">{r.category}</span><span className="chip">{MODE_SHORT[r.mode]}{r.mode !== 'REMOTE' && r.city ? ` · ${r.city}` : ''}</span></div>
            <h3 className="mt-2 font-bold leading-snug">{r.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/70">{r.description}</p>
            <p className="mt-2 text-sm">Budget <b className="text-gold">{rp(r.budget)}</b> <span className="text-white/50">· {PM_LABEL[r.pricing_model]}</span></p>
            <p className="mt-1 text-[11px] text-white/40">{pm[r.buyer_id]?.full_name} · {dateID(r.created_at)}</p>
          </Link>
        ))}
        {!shown.length && <div className="card text-center text-sm text-white/60">Belum ada permintaan di kategori ini.</div>}
      </div>
    </div>
  );
}
