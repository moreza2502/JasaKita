'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { insert } from '@/lib/db';
import { guard } from '@/lib/aiclient';
import type { Mode } from '@/lib/types';
import { GateBanner, RequireAuth, useGate } from '@/components/Gate';
import LocationPicker, { Loc } from '@/components/LocationPicker';
import { CategoryPicker } from '@/components/CategoryPicker';

export default function PermintaanBaru() {
  const { user } = useAuth(); const { ok } = useGate(); const router = useRouter();
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  const [sel, setSel] = useState<string[]>([]); const [cats, setCats] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('ONSITE'); const [loc, setLoc] = useState<Loc>({ province: '', city: '', district: '' });
  const [pm, setPm] = useState('PROJECT'); const [budget, setBudget] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  async function submit() {
    setErr('');
    if (!ok) return setErr('Lengkapi data wajib profil dulu (foto, WhatsApp, domisili, email).');
    if (!sel.length) return setErr('Pilih jenis jasa yang kamu butuhkan.');
    if (title.trim().length < 8) return setErr('Judul minimal 8 karakter.');
    if (desc.trim().length < 20) return setErr('Jelaskan masalahmu minimal 20 karakter.');
    if (!Number(budget)) return setErr('Isi estimasi budget.');
    if (mode === 'ONSITE' && !(loc.province && loc.city && loc.district)) return setErr('Pilih lokasi lengkap untuk layanan On-Site.');
    setBusy(true);
    const v = await guard('request', title, desc, user!.id);
    if (!v.ok) { setErr(v.reason); setBusy(false); return; }
    try {
      const r = await insert<any>('requests', { buyer_id: user!.id, title: title.trim(), description: desc.trim(), category: cats[0] || '', item: sel[0], mode, province: mode === 'REMOTE' ? '' : loc.province, city: mode === 'REMOTE' ? '' : loc.city, district: mode === 'REMOTE' ? '' : loc.district, pricing_model: pm, budget: Number(budget), status: 'OPEN' });
      router.push(`/permintaan/${r.id}`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }
  return (
    <RequireAuth>
      <div className="pt-5">
        <h1 className="text-2xl font-extrabold">Pasang Permintaan Jasa</h1>
        <GateBanner />
        <label className="label">Jasa apa yang kamu butuhkan? *</label>
        <CategoryPicker multi={false} value={sel} onChange={(i, c) => { setSel(i); setCats(c); }} />
        <label className="label">Judul *</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Atap rumah bocor di Sawangan" />
        <label className="label">Masalah / kebutuhan *</label><textarea className="input" rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <label className="label">Mode *</label>
        <select className="input" value={mode} onChange={(e) => setMode(e.target.value as Mode)}><option value="ONSITE">On-Site (penyedia datang ke lokasi)</option><option value="REMOTE">Remote / Online</option></select>
        {mode === 'ONSITE' && <div className="mt-2"><LocationPicker value={loc} onChange={setLoc} /></div>}
        <label className="label">Model harga yang diinginkan</label>
        <select className="input" value={pm} onChange={(e) => setPm(e.target.value)}><option value="HOURLY">Per Jam</option><option value="DAILY">Harian</option><option value="PROJECT">Per Proyek</option></select>
        <label className="label">Estimasi budget (Rp) *</label><input className="input" inputMode="numeric" value={budget ? Number(budget).toLocaleString('id-ID') : ''} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))} placeholder="1.500.000" />
        {err && <p className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">{err}</p>}
        <button className="btn-primary mt-5 w-full" disabled={busy || !ok} onClick={submit}>{busy ? 'Memeriksa & menyimpan…' : 'Pasang Permintaan'}</button>
      </div>
    </RequireAuth>
  );
}
