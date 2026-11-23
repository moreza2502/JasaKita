import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'JasaKita - Marketplace jasa tanpa komisi',
  description: 'Cari jasa terdekat atau tawarkan keahlianmu. 0% komisi, langsung antara pembeli dan penyedia.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'JasaKita', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
};
export const viewport: Viewport = { themeColor: '#071A17', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <Providers>
          <Header />
          <main className="mx-auto max-w-2xl px-4 pb-6">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
