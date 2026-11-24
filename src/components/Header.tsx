'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { isDemo } from '@/lib/supabase';
import { completeness } from '@/lib/trust';

export default function Header() {
  const { user, profile, contactEmail, loading } = useAuth();
  const todo = profile ? completeness(profile, contactEmail).missing.length : 0;
  return (
    <>
      {isDemo && <div className="bg-gold/15 text-gold text-[11px] text-center py-1">Mode DEMO: data contoh & AI simulasi (isi .env.local untuk mode live)</div>}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight">Jasa<span className="hl">Kita</span></Link>
          <div className="flex items-center gap-2">
            {profile?.is_admin && <Link href="/admin" className="chip">Admin</Link>}
            {!loading && !user && <Link href="/masuk" className="btn-ghost !py-2">Masuk</Link>}
            {/* Ikon profil selalu bisa diketuk: masuk jika belum login, buka Profil jika sudah */}
            <Link href={user ? '/profil' : '/masuk'} aria-label="Profil" className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-card">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="text-lg">👤</span>}
              {user && todo > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold">{todo}</span>}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
