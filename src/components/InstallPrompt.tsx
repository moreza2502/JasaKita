'use client';
import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [evt, setEvt] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [hide, setHide] = useState(true);
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (standalone || sessionStorage.getItem('jk_hide_install')) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos); if (isIos) setHide(false);
    const h = (e: any) => { e.preventDefault(); setEvt(e); setHide(false); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  if (hide) return null;
  const close = () => { sessionStorage.setItem('jk_hide_install', '1'); setHide(true); };
  return (
    <div className="fixed left-3 right-3 bottom-24 z-40 mx-auto max-w-md rounded-2xl border border-line bg-card p-4 shadow-xl">
      <p className="text-sm font-semibold">Install Aplikasi / Tambahkan ke Layar Utama</p>
      {ios ? (
        <p className="mt-1 text-xs text-white/70">Di Safari: ketuk tombol Bagikan (kotak dengan panah ke atas), lalu pilih <b>Tambahkan ke Layar Utama</b>.</p>
      ) : (
        <p className="mt-1 text-xs text-white/70">Buka JasaKita langsung dari layar utama HP, tanpa Play Store.</p>
      )}
      <div className="mt-3 flex gap-2">
        {evt && <button className="btn-primary flex-1" onClick={async () => { evt.prompt(); await evt.userChoice; setHide(true); }}>Install Aplikasi</button>}
        <button className="btn-ghost flex-1" onClick={close}>Nanti</button>
      </div>
    </div>
  );
}
