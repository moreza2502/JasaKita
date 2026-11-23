'use client';
import { useState } from 'react';
import { WARRANTY_PRESETS } from '@/lib/constants';

export default function WarrantyPicker({ days, desc, onDays, onDesc }: { days: number; desc: string; onDays: (n: number) => void; onDesc: (s: string) => void }) {
  const [custom, setCustom] = useState(!WARRANTY_PRESETS.includes(days));
  const sel = custom ? 'custom' : String(days);
  return (
    <>
      <label className="label">Garansi Layanan (after-sales) *</label>
      <select className="input" value={sel} onChange={(e) => { if (e.target.value === 'custom') { setCustom(true); onDays(21); } else { setCustom(false); onDays(Number(e.target.value)); } }}>
        <option value="0">Tanpa Garansi</option><option value="7">Garansi 7 Hari</option><option value="14">Garansi 14 Hari</option><option value="30">Garansi 30 Hari</option><option value="custom">Custom</option>
      </select>
      {custom && <input className="input mt-2" type="number" min={1} max={365} value={days} onChange={(e) => onDays(Math.max(1, Number(e.target.value)))} placeholder="Jumlah hari garansi" />}
      <label className="label">Cakupan layanan purna jual (wajib diisi) *</label>
      <textarea className="input" rows={3} value={desc} onChange={(e) => onDesc(e.target.value)} placeholder="Contoh: Perbaikan ulang gratis jika masalah yang sama muncul lagi akibat kesalahan pengerjaan." />
    </>
  );
}
