'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { isDemo } from '@/lib/supabase';

export default function Header() {
  const { user, profile, loading } = useAuth();
  return (
    <>
      {isDemo && <div className="bg-gold/15 text-gold text-[11px] text-center py-1">Mode DEMO: data contoh & AI simulasi (isi .env.local untuk mode live)</div>}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight">Jasa<span className="hl">Kita</span></Link>
          <div className="flex items-center gap-2">
            {profile?.is_admin && <Link href="/admin" className="chip">Admin</Link>}
            {!loading && !user && <Link href="/masuk" className="btn-ghost !py-2">Masuk</Link>}
            {user && <Link href="/profil" className="flex items-center gap-2 text-sm">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-card border border-line">👤</span>}
            </Link>}
          </div>
        </div>
      </header>
    </>
  );
}
