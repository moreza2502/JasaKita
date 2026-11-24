'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { list, patch, restoreUser, suspendUser, validateReport } from '@/lib/db';
import { dateID } from '@/lib/format';
import type { JobRequest, ModLog, Order, Profile, Report, Service } from '@/lib/types';
import { RequireAuth } from '@/components/Gate';
import { SuggestForm } from '@/components/CategoryPicker';

export default function Admin() {
  const { profile, loading } = useAuth();
  const [tab, setTab] = useState<'ringkasan' | 'laporan' | 'pengguna' | 'kategori' | 'log'>('ringkasan');
  const [d, setD] = useState<{ users: Profile[]; services: Service[]; requests: JobRequest[]; orders: Order[]; reports: Report[]; logs: ModLog[] }>({ users: [], services: [], requests: [], orders: [], reports: [], logs: [] });
  const [note, setNote] = useState('');
  const [sugg, setSugg] = useState<any[]>([]);
  const load = useCallback(async () => {
    const [users, services, requests, orders, reports, logs] = await Promise.all([list<Profile>('profiles'), list<Service>('services'), list<JobRequest>('requests'), list<Order>('orders'), list<Report>('reports'), list<ModLog>('mod_logs')]);
    setD({ users, services, requests, orders, reports, logs });
    setSugg(await list<any>('category_suggestions'));
  }, []);
  useEffect(() => { if (profile?.is_admin) load().catch(console.error); }, [profile, load]);

  if (loading) return <p className="py-10 text-center text-white/60">Memuat…</p>;
  return (
    <RequireAuth>
      {!profile?.is_admin ? <div className="card mt-6 text-center text-sm text-white/70">Halaman ini khusus Admin. Akun kamu tidak punya akses.</div> : (() => {
        const name = (id: string) => d.users.find((u) => u.id === id)?.full_name || id;
        const validCount = (id: string) => d.reports.filter((r) => r.target_id === id && r.status === 'VALID').length;
        const pending = d.reports.filter((r) => r.status === 'PENDING');
        const metrics: [string, number][] = [['Pengguna', d.users.length], ['Jasa aktif', d.services.filter((s) => s.is_active).length], ['Permintaan', d.requests.length], ['Pesanan', d.orders.length], ['Laporan menunggu', pending.length], ['Akun ditangguhkan', d.users.filter((u) => u.status === 'SUSPENDED').length], ['Konten ditolak AI', d.logs.filter((l) => l.verdict === 'REJECTED').length], ['Pesanan selesai', d.orders.filter((o) => o.status === 'CLOSED').length]];
        const act = async (fn: () => Promise<any>, ok: string) => { try { const r = await fn(); setNote(typeof r === 'number' && r >= 3 ? `${ok} Akun otomatis DITANGGUHKAN (${r} laporan valid).` : ok); await load(); } catch (e: any) { setNote(e.message); } };
        return (
          <div className="pt-5">
            <h1 className="text-2xl font-extrabold">Dashboard Admin</h1>
            <div className="mt-4 flex gap-2 overflow-x-auto">{(['ringkasan', 'laporan', 'pengguna', 'kategori', 'log'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`chip whitespace-nowrap capitalize ${tab === t ? '!border-gold !text-gold' : ''}`}>{t === 'log' ? 'Log Moderasi AI' : t}{t === 'kategori' && sugg.some((x) => x.status === 'PENDING') ? ` (${sugg.filter((x) => x.status === 'PENDING').length})` : ''}{t === 'laporan' && pending.length ? ` (${pending.length})` : ''}</button>)}</div>
            {note && <p className="mt-3 rounded-xl border border-line bg-card p-3 text-sm">{note}</p>}

            {tab === 'ringkasan' && <div className="mt-4 grid grid-cols-2 gap-3">{metrics.map(([k, v]) => <div key={k} className="card"><p className="text-3xl font-extrabold text-gold">{v}</p><p className="text-xs text-white/60">{k}</p></div>)}</div>}

            {tab === 'laporan' && <div className="mt-4 space-y-3">
              {d.reports.map((r) => (
                <div key={r.id} className="card text-sm">
                  <div className="flex items-center justify-between"><span className={`chip ${r.status === 'PENDING' ? '!text-gold' : r.status === 'VALID' ? '!text-red-300' : ''}`}>{r.status}</span><span className="text-[11px] text-white/40">{dateID(r.created_at)}</span></div>
                  <p className="mt-2"><b>{name(r.target_id)}</b> dilaporkan oleh {name(r.reporter_id)}</p>
                  <p className="text-white/70">Alasan: {r.reason}</p><p className="mt-1 text-white/60">Bukti: {r.evidence}</p>
                  <p className="mt-1 text-xs text-white/40">Laporan valid terhadap akun ini: {validCount(r.target_id)}/3</p>
                  {r.status === 'PENDING' && <div className="mt-3 flex gap-2"><button className="btn-danger flex-1" onClick={() => act(() => validateReport(r.id, r.target_id), 'Laporan divalidasi.')}>Validasi</button><button className="btn-ghost flex-1" onClick={() => act(() => patch('reports', r.id, { status: 'REJECTED' }), 'Laporan ditolak.')}>Tolak</button></div>}
                </div>
              ))}
              {!d.reports.length && <p className="text-sm text-white/50">Belum ada laporan.</p>}
            </div>}

            {tab === 'pengguna' && <div className="mt-4 space-y-2">
              {d.users.map((u) => (
                <div key={u.id} className="card flex items-center gap-3 !p-3 text-sm"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.full_name} {u.is_admin && <span className="chip ml-1">admin</span>}</p><p className="text-xs text-white/50">{u.status === 'SUSPENDED' ? '⛔ SUSPENDED' : 'Aktif'} · laporan valid {validCount(u.id)}</p></div>
                  {!u.is_admin && (u.status === 'SUSPENDED' ? <button className="btn-primary !py-2" onClick={() => act(() => restoreUser(u.id), 'Akun dipulihkan.')}>Pulihkan</button> : <button className="btn-danger !py-2" onClick={() => act(() => suspendUser(u.id), 'Akun ditangguhkan & semua listing disembunyikan.')}>Suspend</button>)}
                </div>
              ))}
            </div>}

            {tab === 'kategori' && <div className="mt-4 space-y-3">
              <div className="card text-sm text-white/70">Daftar bawaan sudah memuat 22 kategori (A–E) dan bidang <b>F · Kategori Tambahan</b> sebagai bahan pertimbangan. Usulan dari pengguna muncul di bawah; tekan <b>Setujui</b> agar langsung tampil di aplikasi.</div>
              {sugg.map((x) => (
                <div key={x.id} className="card text-sm">
                  <div className="flex items-center justify-between"><span className={`chip ${x.status === 'PENDING' ? '!text-gold' : x.status === 'APPROVED' ? '!text-emerald-300' : '!text-red-300'}`}>{x.status}</span><span className="text-[11px] text-white/40">Bidang {x.group_id} · {dateID(x.created_at)}</span></div>
                  <p className="mt-2 font-semibold">{x.category_name}</p><p className="text-white/70">{x.items}</p><p className="mt-1 text-xs text-white/40">diusulkan oleh {name(x.user_id)}</p>
                  {x.status === 'PENDING' && <div className="mt-3 flex gap-2"><button className="btn-primary flex-1" onClick={() => act(() => patch('category_suggestions', x.id, { status: 'APPROVED' }), 'Kategori disetujui dan sudah tampil.')}>Setujui</button><button className="btn-ghost flex-1" onClick={() => act(() => patch('category_suggestions', x.id, { status: 'REJECTED' }), 'Usulan ditolak.')}>Tolak</button></div>}
                </div>
              ))}
              {!sugg.length && <p className="text-sm text-white/50">Belum ada usulan kategori.</p>}
              <h3 className="pt-2 font-bold">Tambah kategori langsung</h3>
              <SuggestForm asAdmin onDone={load} />
            </div>}

            {tab === 'log' && <div className="mt-4 space-y-2">
              {d.logs.map((l) => (
                <div key={l.id} className="card !p-3 text-sm"><div className="flex items-center justify-between"><span className={`chip ${l.verdict === 'REJECTED' ? '!text-red-300' : '!text-emerald-300'}`}>{l.verdict}</span><span className="text-[11px] text-white/40">{l.kind} · {dateID(l.created_at)}</span></div>
                  <p className="mt-2 font-semibold">{l.title}</p><p className="text-xs text-white/50">oleh {name(l.user_id)}</p>{l.reason && <p className="mt-1 text-xs text-red-200">{l.reason}</p>}</div>
              ))}
              {!d.logs.length && <p className="text-sm text-white/50">Belum ada log.</p>}
            </div>}
          </div>
        );
      })()}
    </RequireAuth>
  );
}
