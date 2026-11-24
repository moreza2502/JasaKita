'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { list, profileMap } from '@/lib/db';
import { GROUPS } from '@/lib/constants';
import type { Profile, Service } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';

export default function Home() {
  const [svcs, setSvcs] = useState<Service[]>([]);
  const [pm, setPm] = useState<Record<string, Profile>>({});
  useEffect(() => {
    (async () => {
      const [s, m] = await Promise.all([list<Service>('services', { is_active: true }), profileMap()]);
      setPm(m); setSvcs(s.filter((x) => m[x.provider_id]?.status !== 'SUSPENDED').slice(0, 4));
    })().catch(console.error);
  }, []);
  return (
    <>
      <section className="pt-8 pb-6">
        <span className="inline-block rounded-full border border-primary/60 bg-primary/15 px-3 py-1 text-xs font-semibold text-emerald-200">Marketplace jasa tanpa komisi</span>
        <h1 className="mt-4 text-[2.4rem] font-extrabold leading-[1.1] tracking-tight">
          Butuh <span className="hl">jasa?</span> Punya <span className="hl">keahlian?</span> Ketemu di sini.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-white/75">
          Dari tukang bangunan, teknisi AC, akuntan, ahli IT, sampai freelancer marketing. Cari yang dekat rumah atau kerja online dari seluruh Indonesia.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/cari" className="btn-primary flex-1">Cari Jasa →</Link>
          <Link href="/masuk?mode=daftar" className="btn-ghost flex-1">Daftar Gratis</Link>
        </div>
      </section>

      <Link href="/cari?ai=1" className="card flex items-center gap-3 hover:border-primary transition">
        <span className="text-2xl">✨</span>
        <span><b className="block text-sm">Cari Jasa dengan AI</b><span className="text-xs text-white/60">Ceritakan masalahmu, AI carikan jasa, model harga, dan garansi yang pas.</span></span>
      </Link>

      <h2 className="mt-8 mb-3 font-bold">Mau cari jasa apa?</h2>
      <div className="grid grid-cols-2 gap-3">
        {GROUPS.map((g) => (
          <Link key={g.id} href={`/cari?g=${g.id}`} className="flex min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-card px-2 py-4 text-center transition hover:border-primary active:scale-95">
            <span className="text-3xl leading-none">{g.icon}</span><span className="text-[13px] font-semibold leading-tight">{g.name}</span><span className="text-[11px] text-white/50">{g.cats.length} kategori</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between"><h2 className="font-bold">Jasa terbaru</h2><Link href="/cari" className="text-sm text-gold">Lihat semua</Link></div>
      <div className="space-y-3">{svcs.map((s) => <ServiceCard key={s.id} s={s} p={pm[s.provider_id]} />)}</div>

      <section className="card mt-8">
        <h2 className="font-bold">Bayar langsung, tanpa potongan</h2>
        <p className="mt-2 text-sm text-white/70">Pembayaran terjadi langsung antara pembeli dan penyedia (0% komisi). Kesepakatan harga, lingkup kerja, dan garansi dicatat di Kesepakatan Kerja Digital sehingga kedua pihak punya pegangan.</p>
        <p className="mt-2 text-sm text-white/70">Profil penyedia wajib minimal 80% lengkap, ada skor kepercayaan, dan akun mencurigakan otomatis ditangguhkan setelah 3 laporan valid.</p>
      </section>
    </>
  );
}
