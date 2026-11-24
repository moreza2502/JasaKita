'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { insert } from '@/lib/db';
import { guard } from '@/lib/aiclient';
import type { Mode } from '@/lib/types';
import { GateBanner, RequireAuth, useGate } from '@/components/Gate';
import LocationPicker, { Loc } from '@/components/LocationPicker';
import WarrantyPicker from '@/components/WarrantyPicker';
import { CategoryPicker, useTree } from '@/components/CategoryPicker';

export default function JasaBaru() {
  const { user } = useAuth(); const { ok } = useGate(); const router = useRouter(); const tree = useTree();
  const [raw, setRaw] = useState(''); const [aiBusy, setAiBusy] = useState(false); const [aiNote, setAiNote] = useState('');
  const [items, setItems] = useState<string[]>([]); const [cats, setCats] = useState<string[]>([]);
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  const [on, setOn] = useState({ h: false, d: false, p: true }); const [price, setPrice] = useState({ h: '', d: '', p: '' });
  const [wd, setWd] = useState(14); const [wdesc, setWdesc] = useState('');
  const [mode, setMode] = useState<Mode>('ONSITE'); const [loc, setLoc] = useState<Loc>({ province: '', city: '', district: '' });
  const [tags, setTags] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  async function fill() {
    setAiBusy(true); setAiNote(''); setErr('');
    try {
      const r = await fetch('/api/ai/listing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: raw }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      const valid: string[] = (j.items || []).filter((i: string) => tree.some((g) => g.cats.some((c) => c.items.includes(i))));
      setItems(valid); setCats(tree.flatMap((g) => g.cats).filter((c) => c.items.some((i) => valid.includes(i))).map((c) => c.name));
      setTitle(j.title || ''); setDesc(j.description || ''); setTags((j.tags || []).join(', '));
      const pm: string[] = j.pricing_models || [];
      setOn({ h: pm.includes('HOURLY'), d: pm.includes('DAILY'), p: pm.includes('PROJECT') });
      if (j.warranty_suggestion && !wdesc) setWdesc(j.warranty_suggestion);
      setAiNote((j.simulated ? 'Hasil simulasi (tanpa Gemini). ' : '') + (valid.length ? '' : 'AI belum menemukan kategori yang cocok, pilih manual di bawah. ') + 'Periksa dan sesuaikan, lalu isi harga sesuai kemampuanmu.');
    } catch (e: any) { setErr(e.message || 'AI gagal, isi manual saja.'); } finally { setAiBusy(false); }
  }

  async function submit() {
    setErr('');
    if (!ok) return setErr('Lengkapi data wajib profil dulu (foto, WhatsApp, domisili, email).');
    const n = (v: string) => (v ? Number(v.replace(/\D/g, '')) : 0);
    const h = on.h ? n(price.h) : 0, d = on.d ? n(price.d) : 0, p = on.p ? n(price.p) : 0;
    if (!items.length) return setErr('Pilih minimal satu layanan pada bagian Kategori & Layanan.');
    if (title.trim().length < 8) return setErr('Judul minimal 8 karakter.');
    if (desc.trim().length < 30) return setErr('Deskripsi minimal 30 karakter.');
    if (!h && !d && !p) return setErr('Aktifkan minimal satu model harga dan isi nominalnya.');
    if (wdesc.trim().length < 10) return setErr('Cakupan layanan purna jual wajib diisi (minimal 10 karakter).');
    if (mode !== 'REMOTE' && !(loc.province && loc.city && loc.district)) return setErr('Pilih Provinsi, Kota/Kabupaten, dan Kecamatan untuk layanan On-Site.');
    setBusy(true);
    const v = await guard('service', title, desc + ' ' + tags, user!.id);
    if (!v.ok) { setErr(v.reason); setBusy(false); return; }
    try {
      const row = await insert<any>('services', {
        provider_id: user!.id, category: cats[0] || '', subcategory: items[0], categories: cats, items, title: title.trim(), description: desc.trim(),
        price_hourly: h || null, price_daily: d || null, price_project: p || null, warranty_days: wd, warranty_desc: wdesc.trim(), mode,
        province: mode === 'REMOTE' ? '' : loc.province, city: mode === 'REMOTE' ? '' : loc.city, district: mode === 'REMOTE' ? '' : loc.district,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8), is_active: true,
      });
      router.push(`/cari/${row.id}`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  const tierRow = (k: 'h' | 'd' | 'p', label: string, unit: string) => (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-line p-3">
      <input type="checkbox" className="h-4 w-4 accent-[#2A8C78]" checked={on[k]} onChange={(e) => setOn({ ...on, [k]: e.target.checked })} />
      <span className="flex-1 text-sm">{label}</span>
      <input className="input !w-32 !py-2" inputMode="numeric" disabled={!on[k]} placeholder={`Rp / ${unit}`} value={price[k]} onChange={(e) => setPrice({ ...price, [k]: e.target.value.replace(/\D/g, '') })} />
    </div>
  );

  return (
    <RequireAuth>
      <div className="pt-5">
        <h1 className="text-2xl font-extrabold">Tawarkan Jasa</h1>
        <GateBanner />
        <div className="card mt-4">
          <p className="text-sm font-semibold">✨ Ceritakan keahlianmu dengan bahasa sehari-hari</p>
          <textarea className="input mt-2" rows={3} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Contoh: saya tukang cat, 10 tahun pengalaman, bisa cat rumah dan ruko, area Depok dan Bogor" />
          <button className="btn-primary mt-2 w-full" disabled={aiBusy || raw.trim().length < 10} onClick={fill}>{aiBusy ? 'AI sedang mengisi…' : 'Bantu Isi dengan AI'}</button>
          {aiNote && <p className="mt-2 text-xs text-emerald-300">{aiNote}</p>}
        </div>

        <label className="label">Kategori & layanan yang kamu tawarkan * (boleh pilih lebih dari satu, atau semua)</label>
        <CategoryPicker value={items} onChange={(i, c) => { setItems(i); setCats(c); }} />

        <label className="label">Judul jasa *</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} />
        <label className="label">Deskripsi *</label><textarea className="input" rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} />

        <label className="label">Model harga (aktifkan satu atau lebih) *</label>
        {tierRow('h', 'Per Jam', 'jam')}{tierRow('d', 'Harian', 'hari')}{tierRow('p', 'Per Proyek / Borongan', 'proyek')}

        <WarrantyPicker days={wd} desc={wdesc} onDays={setWd} onDesc={setWdesc} />

        <label className="label">Mode layanan *</label>
        <select className="input" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="ONSITE">On-Site (Datang ke Lokasi)</option><option value="REMOTE">Remote / Online (seluruh Indonesia)</option><option value="BOTH">Keduanya (On-Site & Remote)</option>
        </select>
        {mode !== 'REMOTE' && <div className="mt-2"><LocationPicker value={loc} onChange={setLoc} /></div>}
        <label className="label">Tag pencarian (pisahkan dengan koma)</label><input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cat tembok, ruko, depok" />

        {err && <p className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">{err}</p>}
        <button className="btn-primary mt-5 w-full" disabled={busy || !ok} onClick={submit}>{busy ? 'Memeriksa & menyimpan…' : 'Terbitkan Jasa'}</button>
        <p className="mt-2 text-center text-[11px] text-white/40">Setiap listing diperiksa AI Content Guard sebelum tayang.</p>
      </div>
    </RequireAuth>
  );
}
