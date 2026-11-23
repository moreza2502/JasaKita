'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Beranda', icon: '🏠' },
  { href: '/cari', label: 'Cari Jasa', icon: '🔍' },
  { href: '/permintaan', label: 'Permintaan', icon: '📋' },
  { href: '/pesanan', label: 'Pesanan', icon: '📦' },
  { href: '/profil', label: 'Profil', icon: '👤' },
];
export default function BottomNav() {
  const path = usePathname() || '/';
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-line bg-bg/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {TABS.map((t) => {
          const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? 'text-gold font-semibold' : 'text-white/60'}`}>
                <span className="text-lg leading-none">{t.icon}</span>{t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
