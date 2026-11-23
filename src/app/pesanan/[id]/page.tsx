'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { closeOrder, get, patch } from '@/lib/db';
import { PM_LABEL, rp, warrantyLabel, dateID } from '@/lib/format';
import type { Order, Profile } from '@/lib/types';
import { RequireAuth } from '@/components/Gate';
import { Countdown, Stepper } from '@/components/OrderStatus';
import ReportButton from '@/components/ReportButton';

export default function PesananDetail() {
  const { id } = useParams<{ id: string }>(); const { user } = useAuth();
  const [o, setO] = useState<Order | null>(null); const [buyer, setBuyer] = useState<Profile | null>(null); const [prov, setProv] = useState<Profile | null>(null);
  const [claim, setClaim] = useState(''); const [showClaim, setShowClaim] = useState(false); const [rating, setRating] = useState(5); const [review, setReview] = useState(''); const [showClose, setShowClose] = useState(false); const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const x = await get<Order>('orders', id); setO(x);
    if (x) { setBuyer(await get<Profile>('profiles', x.buyer_id)); setProv(await get<Profile>('profiles', x.provider_id)); }
  }, [id]);
  useEffect(() => { load().catch(console.error); }, [load]);

  return (
    <RequireAuth>
      {!o ? <p className="py-10 text-center text-white/60">Memuat…</p> : !user || (user.id !== o.buyer_id && user.id !== o.provider_id) ? <p className="py-10 text-center text-white/60">Kamu tidak punya akses ke pesanan ini.</p> : (() => {
        const isBuyer = user.id === o.buyer_id, isProv = user.id === o.provider_id;
        const inWarranty = !!o.warranty_ends_at && new Date(o.warranty_ends_at).getTime() > Date.now();
        const act = async (p: any) => { setErr(''); try { await patch('orders', o.id, p); await load(); } catch (e: any) { setErr(e.message); } };
        const other = isBuyer ? prov : buyer;
        return (
          <div className="pt-5">
            <h1 className="text-2xl font-extrabold leading-tight">{o.title}</h1>
            <p className="mt-1 text-sm text-white/60">{isBuyer ? 'Penyedia' : 'Pembeli'}: {other?.full_name} · dibuat {dateID(o.created_at)}</p>
            <div className="card mt-4"><Stepper status={o.status} /></div>

            {(o.status === 'DONE_WARRANTY' || o.status === 'CLAIM') && (
              <div className="card mt-3 text-center"><p className="text-xs text-white/60">Sisa masa garansi</p>{o.warranty_ends_at && o.warranty_days > 0 ? <Countdown until={o.warranty_ends_at} /> : <span className="text-white/60">Tanpa garansi</span>}</div>
            )}

            <div className="card mt-3 space-y-2 text-sm">
              <p className="font-semibold">Isi Kesepakatan</p>
              <p><span className="text-white/60">Harga:</span> <b className="text-gold">{rp(o.agreed_price)}</b> ({PM_LABEL[o.pricing_model]})</p>
              <p><span className="text-white/60">Pembayaran:</span> {o.dp_percent ? `DP ${o.dp_percent}% · ` : ''}{o.payment_terms}</p>
              <p><span className="text-white/60">Lingkup kerja:</span> {o.scope}</p>
              <p><span className="text-white/60">Garansi:</span> {warrantyLabel(o.warranty_days)} · {o.warranty_desc}</p>
              <p className="text-xs"><span className={o.buyer_ok ? 'text-emerald-300' : 'text-white/40'}>{o.buyer_ok ? '✓' : '○'} Pembeli setuju</span> · <span className={o.provider_ok ? 'text-emerald-300' : 'text-white/40'}>{o.provider_ok ? '✓' : '○'} Penyedia setuju</span></p>
            </div>
            {o.claim_note && o.status === 'CLAIM' && <div className="card mt-3 border-amber-500/50 text-sm"><p className="font-semibold text-amber-300">Klaim garansi</p><p className="mt-1 text-white/80">{o.claim_note}</p></div>}
            {o.status === 'CLOSED' && <div className="card mt-3 text-sm"><p className="font-semibold">Ulasan: <span className="text-gold">{'★'.repeat(o.rating || 0)}</span></p><p className="mt-1 text-white/70">{o.review || '(tanpa teks)'}</p></div>}

            <div className="mt-4 space-y-2">
              {o.status === 'AGREEMENT' && isProv && !o.provider_ok && <button className="btn-primary w-full" onClick={() => act({ provider_ok: true })}>Setujui Kesepakatan</button>}
              {o.status === 'AGREEMENT' && isBuyer && !o.buyer_ok && <button className="btn-primary w-full" onClick={() => act({ buyer_ok: true })}>Setujui Kesepakatan</button>}
              {o.status === 'AGREEMENT' && isProv && o.provider_ok && o.buyer_ok && <button className="btn-primary w-full" onClick={() => act({ status: 'IN_PROGRESS' })}>Mulai Mengerjakan</button>}
              {o.status === 'AGREEMENT' && !(o.provider_ok && o.buyer_ok) && <p className="text-center text-xs text-white/50">Pekerjaan dimulai setelah kedua pihak menyetujui.</p>}
              {o.status === 'IN_PROGRESS' && isProv && <button className="btn-primary w-full" onClick={() => act({ status: 'DONE_WARRANTY', done_at: new Date().toISOString(), warranty_ends_at: new Date(Date.now() + o.warranty_days * 864e5).toISOString() })}>Tandai Pekerjaan Selesai</button>}
              {o.status === 'IN_PROGRESS' && isBuyer && <p className="text-center text-xs text-white/50">Menunggu penyedia menandai pekerjaan selesai.</p>}
              {o.status === 'CLAIM' && isProv && <button className="btn-primary w-full" onClick={() => act({ status: 'DONE_WARRANTY', claim_note: '' })}>Klaim Sudah Ditangani</button>}
              {o.status === 'DONE_WARRANTY' && isBuyer && inWarranty && <button className="btn-ghost w-full" onClick={() => setShowClaim(!showClaim)}>Ajukan Klaim Garansi</button>}
              {showClaim && isBuyer && (
                <div className="card"><textarea className="input" rows={3} value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="Jelaskan masalah yang muncul setelah pekerjaan selesai." />
                  <button className="btn-primary mt-2 w-full" disabled={claim.trim().length < 10} onClick={() => { act({ status: 'CLAIM', claim_note: claim.trim() }); setShowClaim(false); }}>Kirim Klaim</button></div>
              )}
              {(o.status === 'DONE_WARRANTY' || o.status === 'CLAIM') && isBuyer && <button className="btn-primary w-full" onClick={() => setShowClose(!showClose)}>Tutup Pesanan & Beri Ulasan</button>}
              {showClose && isBuyer && (
                <div className="card">
                  <div className="flex justify-center gap-1 text-3xl">{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} bintang`} onClick={() => setRating(n)} className={n <= rating ? 'text-gold' : 'text-white/25'}>★</button>)}</div>
                  <textarea className="input mt-3" rows={3} value={review} onChange={(e) => setReview(e.target.value)} placeholder="Ceritakan pengalamanmu (opsional)" />
                  <button className="btn-primary mt-2 w-full" onClick={async () => { try { await closeOrder(o, rating, review.trim()); setShowClose(false); await load(); } catch (e: any) { setErr(e.message); } }}>Kirim Ulasan & Tutup</button>
                </div>
              )}
            </div>
            {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
            {other && <ReportButton targetId={other.id} />}
          </div>
        );
      })()}
    </RequireAuth>
  );
}
