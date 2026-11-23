'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { insert } from '@/lib/db';

export default function ReportButton({ targetId }: { targetId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Penipuan');
  const [ev, setEv] = useState('');
  const [msg, setMsg] = useState('');
  if (user?.id === targetId) return null;
  async function send() {
    if (ev.trim().length < 15) { setMsg('Tulis catatan bukti minimal 15 karakter.'); return; }
    try {
      await insert('reports', { reporter_id: user!.id, target_id: targetId, reason, evidence: ev.trim(), status: 'PENDING' });
      setMsg('Laporan terkirim. Tim admin akan meninjau. Terima kasih sudah menjaga komunitas.'); setOpen(false); setEv('');
    } catch (e: any) { setMsg(e.message.includes('duplicate') ? 'Kamu sudah melaporkan akun ini.' : e.message); }
  }
  return (
    <div className="mt-4">
      {!user ? <Link href="/masuk" className="text-xs text-red-300 underline">Masuk untuk melaporkan akun</Link>
        : <button className="text-xs text-red-300 underline" onClick={() => setOpen(!open)}>🚩 Laporkan Akun / Penipuan</button>}
      {msg && <p className="mt-2 text-xs text-white/70">{msg}</p>}
      {open && (
        <div className="card mt-2">
          <label className="label !mt-0">Alasan</label>
          <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {['Penipuan', 'Identitas / foto palsu', 'Tidak sesuai kesepakatan', 'Spam / promosi', 'Lainnya'].map((r) => <option key={r}>{r}</option>)}
          </select>
          <label className="label">Catatan bukti *</label>
          <textarea className="input" rows={3} value={ev} onChange={(e) => setEv(e.target.value)} placeholder="Ceritakan kejadian, sebut bukti chat / transfer yang kamu punya." />
          <button className="btn-danger mt-3 w-full" onClick={send}>Kirim Laporan</button>
        </div>
      )}
    </div>
  );
}
