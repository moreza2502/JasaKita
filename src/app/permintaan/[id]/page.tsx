'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get, insert, list, profileMap } from '@/lib/db';
import { MODE_LABEL, PM_LABEL, rp, warrantyLabel } from '@/lib/format';
import type { Bid, JobRequest, Profile } from '@/lib/types';
import { Avatar, NewBadge, TrustBadge } from '@/components/Badges';
import { GateBanner, useGate } from '@/components/Gate';
import WarrantyPicker from '@/components/WarrantyPicker';
import ReportButton from '@/components/ReportButton';

export default function PermintaanDetail() {
  const { id } = useParams<{ id: string }>(); const { user } = useAuth(); const { ok } = useGate();
  const [r, setR] = useState<JobRequest | null>(null); const [bids, setBids] = useState<Bid[]>([]); const [pm, setPm] = useState<Record<string, Profile>>({});
  const [form, setForm] = useState({ pm: 'PROJECT', price: '', duration: '', note: '' }); const [wd, setWd] = useState(14); const [wdesc, setWdesc] = useState('');
  const [err, setErr] = useState(''); const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const req = await get<JobRequest>('requests', id); setR(req); setPm(await profileMap());
    if (req) { setForm((f) => ({ ...f, pm: req.pricing_model })); if (user) setBids(await list<Bid>('bids', { request_id: id })); }
  }, [id, user]);
  useEffect(() => { load().catch(console.error); }, [load]);
  if (!r) return <p className="py-10 text-center text-white/60">Memuat…</p>;
  const owner = user?.id === r.buyer_id; const buyer = pm[r.buyer_id];
  const myBid = bids.find((b) => b.provider_id === user?.id);

  async function send() {
    setErr('');
    if (!Number(form.price)) return setErr('Isi harga penawaran.');
    if (!form.duration.trim()) return setErr('Isi estimasi durasi pengerjaan.');
    if (wdesc.trim().length < 10) return setErr('Cakupan garansi wajib diisi.');
    try {
      await insert('bids', { request_id: id, provider_id: user!.id, pricing_model: form.pm, price: Number(form.price), duration: form.duration.trim(), warranty_days: wd, warranty_desc: wdesc.trim(), note: form.note.trim(), status: 'PENDING' });
      setDone(true); load();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="pt-5">
      <div className="flex flex-wrap gap-2 text-[11px]"><span className="chip">{r.category}</span><span className="chip">{r.status === 'OPEN' ? 'Terbuka' : 'Ditutup'}</span></div>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight">{r.title}</h1>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">{r.description}</p>
      <div className="card mt-4 text-sm space-y-1">
        <p>Budget: <b className="text-gold">{rp(r.budget)}</b> <span className="text-white/50">· {PM_LABEL[r.pricing_model]}</span></p>
        <p>{MODE_LABEL[r.mode]}{r.mode !== 'REMOTE' && r.city ? ` · 📍 ${r.district}, ${r.city}` : ''}</p>
        {buyer && <div className="flex items-center gap-2 pt-2"><Avatar p={buyer} size={28} /><span>{buyer.full_name}</span><NewBadge p={buyer} /></div>}
      </div>

      {!user && <Link href={`/masuk?next=${encodeURIComponent('/permintaan/' + id)}`} className="btn-primary mt-4 w-full">Masuk untuk mengirim penawaran</Link>}

      {owner && (
        <>
          <h2 className="mt-6 font-bold">Penawaran masuk ({bids.length})</h2>
          <div className="mt-3 space-y-3">
            {bids.map((b) => (
              <div key={b.id} className="card">
                <div className="flex items-center gap-2"><Avatar p={pm[b.provider_id]} size={32} /><span className="font-semibold">{pm[b.provider_id]?.full_name}</span>{pm[b.provider_id] && <><NewBadge p={pm[b.provider_id]} /><TrustBadge p={pm[b.provider_id]} /></>}</div>
                <p className="mt-2 text-sm"><b className="text-gold">{rp(b.price)}</b> · {PM_LABEL[b.pricing_model]} · {b.duration}</p>
                <p className="mt-1 text-sm text-white/70">🛡 {warrantyLabel(b.warranty_days)}: {b.warranty_desc}</p>
                {b.note && <p className="mt-1 text-sm text-white/60">“{b.note}”</p>}
                {b.status === 'PENDING' && r.status === 'OPEN' ? <Link href={`/pesanan/baru?bid=${b.id}`} className="btn-primary mt-3 w-full">Terima & Buat Kesepakatan</Link> : <p className="mt-2 text-xs text-emerald-300">{b.status === 'ACCEPTED' ? '✓ Diterima' : ''}</p>}
              </div>
            ))}
            {!bids.length && <div className="card text-center text-sm text-white/60">Belum ada penawaran.</div>}
          </div>
        </>
      )}

      {user && !owner && r.status === 'OPEN' && (
        <div className="mt-6">
          <h2 className="font-bold">Kirim penawaran</h2>
          <GateBanner />
          {myBid || done ? <div className="card mt-3 text-sm text-emerald-300">✓ Penawaranmu sudah terkirim{myBid ? `: ${rp(myBid.price)} (${PM_LABEL[myBid.pricing_model]})` : ''}. Pembeli akan menghubungimu.</div> : (
            <>
              <label className="label">Model harga</label>
              <select className="input" value={form.pm} onChange={(e) => setForm({ ...form, pm: e.target.value })}><option value="HOURLY">Per Jam</option><option value="DAILY">Harian</option><option value="PROJECT">Per Proyek</option></select>
              <label className="label">Harga penawaran (Rp) *</label><input className="input" inputMode="numeric" value={form.price ? Number(form.price).toLocaleString('id-ID') : ''} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, '') })} />
              <label className="label">Estimasi durasi *</label><input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2 hari / 1 minggu" />
              <WarrantyPicker days={wd} desc={wdesc} onDays={setWd} onDesc={setWdesc} />
              <label className="label">Catatan untuk pembeli</label><textarea className="input" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
              <button className="btn-primary mt-4 w-full" disabled={!ok} onClick={send}>Kirim Penawaran</button>
            </>
          )}
        </div>
      )}
      {!owner && buyer && <ReportButton targetId={buyer.id} />}
    </div>
  );
}
