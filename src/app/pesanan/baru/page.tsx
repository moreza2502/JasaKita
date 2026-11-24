'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get, insert, patch } from '@/lib/db';
import { useQ } from '@/lib/hooks';
import { PM_LABEL } from '@/lib/format';
import type { Bid, JobRequest, Profile, Service } from '@/lib/types';
import { GateBanner, RequireAuth, useGate } from '@/components/Gate';
import WarrantyPicker from '@/components/WarrantyPicker';

export default function PesananBaru() {
  const { user } = useAuth(); const { ok } = useGate(); const router = useRouter();
  const sid = useQ('service'); const bid = useQ('bid'); const pm0 = useQ('pm');
  const [f, setF] = useState({ title: '', price: '', pm: 'PROJECT', dp: '0', terms: '', scope: '', provider_id: '', service_id: '', request_id: '', bid_id: '' });
  const [wd, setWd] = useState(14); const [wdesc, setWdesc] = useState(''); const [prov, setProv] = useState<Profile | null>(null);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (sid) {
        const s = await get<Service>('services', sid); if (!s) return;
        const pm = pm0 || (s.price_project ? 'PROJECT' : s.price_daily ? 'DAILY' : 'HOURLY');
        const price = pm === 'HOURLY' ? s.price_hourly : pm === 'DAILY' ? s.price_daily : s.price_project;
        setF((x) => ({ ...x, title: s.title, price: String(price || ''), pm, provider_id: s.provider_id, service_id: s.id }));
        setWd(s.warranty_days); setWdesc(s.warranty_desc); setProv(await get<Profile>('profiles', s.provider_id)); setReady(true);
      } else if (bid) {
        const b = await get<Bid>('bids', bid); if (!b) return; const r = await get<JobRequest>('requests', b.request_id); if (!r) return;
        setF((x) => ({ ...x, title: r.title, price: String(b.price), pm: b.pricing_model, scope: r.description, provider_id: b.provider_id, request_id: r.id, bid_id: b.id }));
        setWd(b.warranty_days); setWdesc(b.warranty_desc); setProv(await get<Profile>('profiles', b.provider_id)); setReady(true);
      }
    })().catch(console.error);
  }, [sid, bid, pm0]);

  async function submit() {
    setErr('');
    if (!ok) return setErr('Lengkapi data wajib profil dulu (foto, WhatsApp, domisili, email).');
    if (!Number(f.price)) return setErr('Isi harga yang disepakati.');
    if (f.scope.trim().length < 15) return setErr('Tulis ruang lingkup pekerjaan minimal 15 karakter.');
    if (f.terms.trim().length < 5) return setErr('Tulis ketentuan pembayaran (contoh: DP 30%, sisanya setelah selesai).');
    if (wdesc.trim().length < 10) return setErr('Cakupan garansi wajib diisi.');
    if (f.provider_id === user!.id) return setErr('Kamu tidak bisa memesan jasamu sendiri.');
    setBusy(true);
    try {
      const o = await insert<any>('orders', { title: f.title, service_id: f.service_id || null, request_id: f.request_id || null, buyer_id: user!.id, provider_id: f.provider_id, pricing_model: f.pm, agreed_price: Number(f.price), dp_percent: Number(f.dp) || 0, payment_terms: f.terms.trim(), scope: f.scope.trim(), warranty_days: wd, warranty_desc: wdesc.trim(), status: 'AGREEMENT', buyer_ok: true, provider_ok: false, done_at: null, warranty_ends_at: null, claim_note: '', rating: null, review: '' });
      if (f.bid_id) { await patch('bids', f.bid_id, { status: 'ACCEPTED' }); await patch('requests', f.request_id, { status: 'CLOSED' }); }
      router.push(`/pesanan/${o.id}`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <RequireAuth>
      <div className="pt-5">
        <h1 className="text-2xl font-extrabold">Kesepakatan Kerja Digital</h1>
        <p className="mt-1 text-sm text-white/60">Kunci harga, ketentuan bayar, lingkup kerja, dan garansi. Pembayaran dilakukan langsung ke penyedia (0% komisi).</p>
        <GateBanner />
        {!ready ? <p className="py-8 text-center text-white/60">Memuat data jasa…</p> : (
          <>
            <div className="card mt-4 text-sm"><p className="text-white/60">Penyedia</p><p className="font-semibold">{prov?.full_name}</p><p className="mt-2 text-white/60">Pekerjaan</p><p className="font-semibold">{f.title}</p></div>
            <label className="label">Harga disepakati (Rp) *</label><input className="input" inputMode="numeric" value={f.price ? Number(f.price).toLocaleString('id-ID') : ''} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, '') })} />
            <label className="label">Model harga</label>
            <select className="input" value={f.pm} onChange={set('pm')}>{Object.entries(PM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <label className="label">Uang muka / DP (%)</label><input className="input" type="number" min={0} max={100} value={f.dp} onChange={set('dp')} />
            <label className="label">Ketentuan pembayaran *</label><textarea className="input" rows={2} value={f.terms} onChange={set('terms')} placeholder="Contoh: DP 30% sebelum mulai, pelunasan 70% setelah pekerjaan selesai dicek." />
            <label className="label">Ruang lingkup pekerjaan *</label><textarea className="input" rows={4} value={f.scope} onChange={set('scope')} />
            <WarrantyPicker days={wd} desc={wdesc} onDays={setWd} onDesc={setWdesc} />
            {err && <p className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">{err}</p>}
            <button className="btn-primary mt-5 w-full" disabled={busy || !ok} onClick={submit}>{busy ? 'Menyimpan…' : 'Buat Kesepakatan & Minta Persetujuan Penyedia'}</button>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
