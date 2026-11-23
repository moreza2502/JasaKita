'use client';
import { useEffect, useState } from 'react';
import type { OrderStatus } from '@/lib/types';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  AGREEMENT: 'Kesepakatan Dibuat', IN_PROGRESS: 'Sedang Dikerjakan', DONE_WARRANTY: 'Selesai - Masa Garansi Aktif', CLAIM: 'Klaim Garansi', CLOSED: 'Tutup Pesanan & Ulasan',
};
const ORDER: OrderStatus[] = ['AGREEMENT', 'IN_PROGRESS', 'DONE_WARRANTY', 'CLAIM', 'CLOSED'];

export function Stepper({ status }: { status: OrderStatus }) {
  const idx = ORDER.indexOf(status);
  return (
    <ol className="space-y-2">
      {ORDER.map((s, i) => (
        <li key={s} className={`flex items-center gap-3 text-sm ${i <= idx ? 'text-white' : 'text-white/35'}`}>
          <span className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${i < idx ? 'bg-primary border-primary' : i === idx ? 'border-gold text-gold' : 'border-line'}`}>{i < idx ? '✓' : i + 1}</span>
          <span className={i === idx ? 'font-semibold text-gold' : ''}>{STATUS_LABEL[s]}</span>
        </li>
      ))}
    </ol>
  );
}
export function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return <span className="text-white/60">Masa garansi telah berakhir</span>;
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4), s = Math.floor((ms % 6e4) / 1e3);
  const z = (n: number) => String(n).padStart(2, '0');
  return <span className="font-mono text-lg text-gold">{d} hari {z(h)}:{z(m)}:{z(s)}</span>;
}
