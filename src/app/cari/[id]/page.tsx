'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get } from '@/lib/db';
import { MODE_LABEL, PM_LABEL, PM_UNIT, rp, tiers, warrantyLabel, waLink } from '@/lib/format';
import { avgRating, ageDays, completeness } from '@/lib/trust';
import type { Profile, Service } from '@/lib/types';
import { Avatar, NewBadge, Stars, TrustBadge } from '@/components/Badges';
import ReportButton from '@/components/ReportButton';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [s, setS] = useState<Service | null>(null); const [p, setP] = useState<Profile | null>(null);
  const [wa, setWa] = useState(''); const [pm, setPm] = useState(''); const [miss, setMiss] = useState(false);
  useEffect(() => {
    (async () => {
      const sv = await get<Service>('services', id); if (!sv) { setMiss(true); return; }
      setS(sv); setPm(tiers(sv)[0]?.pm || ''); setP(await get<Profile>('profiles', sv.provider_id));
    })().catch(() => setMiss(true));
  }, [id]);
  // Nomor WhatsApp hanya diambil setelah pembeli login
  useEffect(() => { if (user && s) get<any>('contacts', s.provider_id).then((c) => setWa(c?.whatsapp || '')).catch(() => {}); }, [user, s]);

  if (miss) return <p className="py-10 text-center text-white/60">Jasa tidak ditemukan atau sudah tidak aktif.</p>;
  if (!s || !p) return <p className="py-10 text-center text-white/60">Memuat…</p>;
  const mine = user?.id === p.id;
  const msg = `Halo ${p.full_name}, saya tertarik dengan jasa "${s.title}" di JasaKita.\nModel harga: ${PM_LABEL[pm] || '-'}${pm ? ` (${rp(tiers(s).find((t) => t.pm === pm)?.price)} / ${PM_UNIT[pm]})` : ''}\nGaransi: ${warrantyLabel(s.warranty_days)}\nMohon info ketersediaan dan detailnya.`;

  return (
    <div className="pt-5">
      {p.status === 'SUSPENDED' && <div className="card mb-3 border-red-500/60 text-sm text-red-300">Akun penyedia ini ditangguhkan.</div>}
      {!s.is_active && <div className="card mb-3 text-sm text-white/70">Listing ini sedang nonaktif.</div>}
      <div className="flex flex-wrap gap-2 text-[11px]">{(s.categories?.length ? s.categories : [s.category]).map((c) => <span key={c} className="chip !text-gold">{c}</span>)}{(s.items?.length ? s.items : [s.subcategory]).map((i) => <span key={i} className="chip">{i}</span>)}</div>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight">{s.title}</h1>

      <div className="card mt-4 space-y-2">
        {tiers(s).map((t) => (
          <label key={t.pm} className="flex items-center gap-3 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-gold">
            <input type="radio" name="pm" checked={pm === t.pm} onChange={() => setPm(t.pm)} className="accent-[#EAB308]" />
            <span className="flex-1 text-sm">{PM_LABEL[t.pm]}</span><b className="text-gold">{rp(t.price)}</b><span className="text-xs text-white/50">/ {PM_UNIT[t.pm]}</span>
          </label>
        ))}
      </div>

      <h2 className="mt-5 font-bold">Tentang jasa ini</h2>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/80">{s.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{s.tags?.map((t) => <span key={t} className="chip">#{t}</span>)}</div>

      <div className="card mt-5">
        <p className="font-semibold">🛡 {warrantyLabel(s.warranty_days)}</p>
        <p className="mt-1 text-sm text-white/70">{s.warranty_desc}</p>
      </div>
      <div className="card mt-3 text-sm">
        <p className="font-semibold">{MODE_LABEL[s.mode]}</p>
        {s.mode !== 'REMOTE' && <p className="mt-1 text-white/70">📍 {s.district}, {s.city}, {s.province}</p>}
        {s.mode !== 'ONSITE' && <p className="mt-1 text-white/70">🌐 Bisa dikerjakan online ke seluruh Indonesia</p>}
      </div>

      <div className="card mt-3">
        <div className="flex items-center gap-3"><Avatar p={p} size={48} />
          <div><p className="font-semibold">{p.full_name}</p><div className="mt-1 flex flex-wrap items-center gap-1.5"><NewBadge p={p} /><TrustBadge p={p} /></div></div></div>
        <p className="mt-3 text-sm text-white/70">{p.bio}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60"><Stars p={p} /><span>{p.completed_orders} pesanan selesai</span><span>Bergabung {ageDays(p)} hari lalu</span><span>Profil {completeness(p).pct}%</span></div>
        {p.social_url && <a href={p.social_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 block truncate text-xs text-gold underline">{p.social_url}</a>}
      </div>

      {!mine && s.is_active && p.status === 'ACTIVE' && (
        <div className="mt-5 space-y-2">
          {user ? (
            wa ? <a className="btn-primary w-full" href={waLink(wa, msg)} target="_blank" rel="noopener noreferrer">Hubungi via WhatsApp</a>
              : <p className="text-sm text-white/60">Memuat kontak…</p>
          ) : (
            <Link href={`/masuk?next=${encodeURIComponent('/cari/' + s.id)}`} className="btn-primary w-full">Masuk untuk Hubungi via WhatsApp</Link>
          )}
          {user && <Link href={`/pesanan/baru?service=${s.id}&pm=${pm}`} className="btn-ghost w-full">Buat Kesepakatan Kerja Digital</Link>}
          <p className="text-center text-[11px] text-white/40">Nomor WhatsApp disembunyikan untuk pengunjung yang belum masuk. Tidak ada komisi; bayar langsung ke penyedia.</p>
        </div>
      )}
      {mine && <Link href="/profil" className="btn-ghost mt-5 w-full">Ini jasamu · kelola di Profil</Link>}
      {!mine && <ReportButton targetId={p.id} />}
    </div>
  );
}
