'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { list, profileMap } from '@/lib/db';
import { PM_LABEL } from '@/lib/format';
import { avgRating } from '@/lib/trust';
import { useQ } from '@/lib/hooks';
import type { Profile, Service } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';
import LocationPicker, { Loc } from '@/components/LocationPicker';
import { CategoryBrowse, Flt, useTree } from '@/components/CategoryPicker';

const eq = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

export default function Cari() {
  const tree = useTree();
  const [all, setAll] = useState<Service[]>([]); const [pm, setPm] = useState<Record<string, Profile>>({});
  const [q, setQ] = useState(''); const [flt, setFlt] = useState<Flt>({}); const [mode, setMode] = useState(''); const [tier, setTier] = useState('');
  const [loc, setLoc] = useState<Loc>({ province: '', city: '', district: '' }); const [showF, setShowF] = useState(false);
  const [ai, setAi] = useState(''); const [aiBusy, setAiBusy] = useState(false); const [aiRes, setAiRes] = useState<any>(null); const [aiErr, setAiErr] = useState('');
  const gQ = useQ('g'); const cQ = useQ('c'); const aiQ = useQ('ai');
  useEffect(() => { if (gQ) setFlt({ g: gQ, c: cQ || undefined }); }, [gQ, cQ]);
  useEffect(() => {
    (async () => {
      const [s, m] = await Promise.all([list<Service>('services', { is_active: true }), profileMap()]);
      setPm(m); setAll(s.filter((x) => m[x.provider_id]?.status !== 'SUSPENDED'));
    })().catch(console.error);
  }, []);

  const rows = useMemo(() => all.filter((s) => {
    const cats = s.categories?.length ? s.categories : [s.category]; const items = s.items || [];
    if (flt.i) { if (!items.includes(flt.i)) return false; }
    else if (flt.c) { if (!cats.includes(flt.c)) return false; }
    else if (flt.g) { const names = tree.find((g) => g.id === flt.g)?.cats.map((c) => c.name) || []; if (!cats.some((c) => names.includes(c))) return false; }
    if (mode === 'ONSITE' && s.mode === 'REMOTE') return false;
    if (mode === 'REMOTE' && s.mode === 'ONSITE') return false;
    if (tier === 'HOURLY' && !s.price_hourly) return false;
    if (tier === 'DAILY' && !s.price_daily) return false;
    if (tier === 'PROJECT' && !s.price_project) return false;
    // Filter lokasi ketat untuk layanan On-Site; Remote berlaku se-Indonesia
    if (s.mode !== 'REMOTE' && (loc.province || loc.city || loc.district)) {
      if (loc.province && !eq(s.province, loc.province)) return false;
      if (loc.city && !eq(s.city, loc.city)) return false;
      if (loc.district && !eq(s.district, loc.district)) return false;
    }
    if (q) { const h = `${s.title} ${s.description} ${cats.join(' ')} ${items.join(' ')} ${(s.tags || []).join(' ')}`.toLowerCase(); if (!q.toLowerCase().split(/\s+/).every((w) => h.includes(w))) return false; }
    return true;
  }), [all, q, flt, mode, tier, loc, tree]);

  async function askAi() {
    setAiErr(''); setAiRes(null); setAiBusy(true);
    try {
      const compact = all.map((s) => ({ id: s.id, title: s.title, categories: s.categories, items: s.items, tags: s.tags, mode: s.mode, city: s.city, provider: pm[s.provider_id]?.full_name, rating: Number(avgRating(pm[s.provider_id] || ({ rating_count: 0, rating_sum: 0 } as any)).toFixed(1)) }));
      const r = await fetch('/api/ai/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: ai, services: compact }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Gagal');
      setAiRes(j);
    } catch (e: any) { setAiErr(e.message); } finally { setAiBusy(false); }
  }
  const ranked = aiRes ? (aiRes.ranked_ids as string[]).map((id) => all.find((s) => s.id === id)).filter(Boolean) as Service[] : [];

  return (
    <div className="pt-5">
      <h1 className="text-2xl font-extrabold">Cari Jasa</h1>

      <div className={`card mt-4 ${aiQ ? 'border-primary' : ''}`}>
        <p className="text-sm font-semibold">✨ Cari Jasa dengan AI</p>
        <textarea className="input mt-2" rows={2} value={ai} onChange={(e) => setAi(e.target.value)} placeholder="Contoh: atap kamar saya bocor kalau hujan, rumah di Depok" />
        <button className="btn-primary mt-2 w-full" disabled={aiBusy || ai.trim().length < 4} onClick={askAi}>{aiBusy ? 'AI sedang mencari…' : 'Tanya AI'}</button>
        {aiErr && <p className="mt-2 text-sm text-red-300">{aiErr}</p>}
        {aiRes && (
          <div className="mt-3 space-y-2 text-sm">
            <p>{aiRes.summary}</p>
            <p><span className="text-white/60">Model harga disarankan:</span> <b className="text-gold">{PM_LABEL[aiRes.pricing_model] || aiRes.pricing_model}</b>. {aiRes.pricing_reason}</p>
            <p><span className="text-white/60">Saran garansi:</span> {aiRes.warranty_advice}</p>
            {ranked.length ? <div className="space-y-3 pt-2">{ranked.map((s) => <ServiceCard key={s.id} s={s} p={pm[s.provider_id]} />)}</div>
              : <p className="text-white/60">Belum ada listing yang cocok. <Link href="/permintaan/baru" className="text-gold underline">Pasang permintaan jasa</Link> agar penyedia yang menawar.</p>}
          </div>
        )}
      </div>

      <h2 className="mb-3 mt-6 font-bold">Pilih kategori</h2>
      <CategoryBrowse value={flt} onChange={setFlt} />

      <div className="mt-5 flex gap-2">
        <input className="input" placeholder="Atau ketik: atap bocor, cuci AC, website…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-ghost" onClick={() => setShowF(!showF)}>Filter</button>
      </div>
      {showF && (
        <div className="card mt-3">
          <label className="label !mt-0">Mode layanan</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}><option value="">Semua</option><option value="ONSITE">On-Site (datang ke lokasi)</option><option value="REMOTE">Remote / Online</option></select>
          <label className="label">Model harga</label>
          <select className="input" value={tier} onChange={(e) => setTier(e.target.value)}><option value="">Semua</option><option value="HOURLY">Per Jam</option><option value="DAILY">Harian</option><option value="PROJECT">Per Proyek</option></select>
          <label className="label">Lokasi (untuk layanan On-Site)</label>
          <LocationPicker any value={loc} onChange={setLoc} />
        </div>
      )}
      <p className="mt-4 text-xs text-white/50">{rows.length} jasa ditemukan</p>
      <div className="mt-2 space-y-3">
        {rows.map((s) => <ServiceCard key={s.id} s={s} p={pm[s.provider_id]} />)}
        {!rows.length && <div className="card text-center text-sm text-white/60">Belum ada jasa yang cocok. Coba ubah filter atau <Link href="/permintaan/baru" className="text-gold underline">pasang permintaan jasa</Link>.</div>}
      </div>
      <Link href="/jasa/baru" className="btn-primary mt-6 w-full">+ Tawarkan Jasa Saya</Link>
    </div>
  );
}
