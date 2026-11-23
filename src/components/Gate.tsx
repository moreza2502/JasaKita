'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { completeness } from '@/lib/trust';

export function useGate() {
  const { profile } = useAuth();
  const c = profile ? completeness(profile) : null;
  return { ok: !!c && c.pct >= 80, c };
}
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="py-10 text-center text-white/60">Memuat…</p>;
  if (!user) return (
    <div className="card mt-6 text-center">
      <p className="font-semibold">Masuk dulu untuk melanjutkan</p>
      <p className="mt-1 text-sm text-white/60">Kamu bisa masuk dengan Google atau email.</p>
      <Link href={`/masuk?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`} className="btn-primary mt-4">Masuk / Daftar</Link>
    </div>
  );
  return <>{children}</>;
}
export function GateBanner() {
  const { c } = useGate();
  if (!c || c.pct >= 80) return null;
  return (
    <div className="card mt-4 border-amber-500/50">
      <p className="font-semibold text-amber-300">Lengkapi profil dulu ({c.pct}% / minimal 80%)</p>
      <p className="mt-1 text-xs text-white/70">Demi keamanan, hanya profil yang sudah lengkap yang bisa menerbitkan jasa atau mengirim penawaran.</p>
      <ul className="mt-2 text-xs space-y-0.5">{c.items.map((i) => <li key={i.label} className={i.ok ? 'text-emerald-300' : 'text-white/60'}>{i.ok ? '✓' : '○'} {i.label}</li>)}</ul>
      <Link href="/profil" className="btn-primary mt-3">Lengkapi Profil</Link>
    </div>
  );
}
