'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { list, patch, resetDemo, upsertContact } from '@/lib/db';
import { uploadAvatar } from '@/lib/image';
import { isDemo } from '@/lib/supabase';
import { avgRating, ageDays, completeness, trustScore } from '@/lib/trust';
import { waLink, warrantyLabel } from '@/lib/format';
import type { Service } from '@/lib/types';
import { Avatar, NewBadge, TrustBadge } from '@/components/Badges';
import { RequireAuth } from '@/components/Gate';
import LocationPicker, { Loc } from '@/components/LocationPicker';

const Req = () => <span className="ml-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-300">Wajib</span>;

export default function Profil() {
  const { user, profile, whatsapp, contactEmail, refresh, signOut } = useAuth();
  const [f, setF] = useState({ full_name: '', bio: '', social_url: '', wa: '', email: '' }); const [loc, setLoc] = useState<Loc>({ province: '', city: '', district: '' });
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 900000))); const [sent, setSent] = useState(false); const [confirmed, setConfirmed] = useState(false);
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const [mine, setMine] = useState<Service[]>([]);

  useEffect(() => {
    if (!profile) return;
    setF({ full_name: profile.full_name, bio: profile.bio, social_url: profile.social_url, wa: whatsapp, email: contactEmail || user?.email || '' });
    setLoc({ province: profile.province, city: profile.city, district: profile.district });
  }, [profile?.id, whatsapp, contactEmail]); // eslint-disable-line
  useEffect(() => { if (user) list<Service>('services', { provider_id: user.id }).then(setMine).catch(() => {}); }, [user]);

  return (
    <RequireAuth>
      {!user || !profile ? (
        <div className="card mt-6 text-center">
          <p className="font-semibold">Profil belum bisa dimuat</p>
          <p className="mt-1 text-sm text-white/60">Biasanya karena koneksi lambat atau database belum diperbarui. Coba lagi, atau keluar lalu masuk kembali.</p>
          <div className="mt-4 flex gap-2"><button className="btn-primary flex-1" onClick={() => refresh()}>Coba Lagi</button><button className="btn-ghost flex-1" onClick={signOut}>Keluar</button></div>
        </div>
      ) : (() => {
        const clean = (v: string) => v.replace(/\D/g, '');
        const waChanged = clean(f.wa) !== clean(whatsapp);
        const waOk = profile.wa_verified && !waChanged;
        const preview = { ...profile, full_name: f.full_name, bio: f.bio, social_url: f.social_url, province: loc.province, city: loc.city, district: loc.district, wa_verified: waOk };
        const c = completeness(preview, f.email);

        async function save(extra: any = {}) {
          setMsg(''); setBusy(true);
          try {
            if (f.wa && !/^(\+?62|0)8\d{7,12}$/.test(f.wa.replace(/[\s-]/g, ''))) throw new Error('Format nomor WhatsApp tidak valid (contoh: 0812xxxxxxx).');
            if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) throw new Error('Format alamat email tidak valid.');
            if (f.social_url && !/^https?:\/\/.+\..+/.test(f.social_url)) throw new Error('Link sosial media harus diawali https://');
            await upsertContact(user!.id, f.wa.replace(/[\s-]/g, ''), f.email.trim());
            await patch('profiles', user!.id, { full_name: f.full_name.trim(), bio: f.bio.trim(), social_url: f.social_url.trim(), province: loc.province, city: loc.city, district: loc.district, wa_verified: waChanged ? false : profile!.wa_verified, ...extra });
            await refresh(); setMsg('Profil tersimpan.');
          } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
        }
        async function photo(file?: File) {
          if (!file) return; setBusy(true); setMsg('');
          try { const url = await uploadAvatar(user!.id, file); await patch('profiles', user!.id, { avatar_url: url }); await refresh(); setMsg('Foto tersimpan.'); } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
        }
        const confirmWa = async () => { await save({ wa_verified: true }); setSent(false); setConfirmed(false); };
        const toggle = async (s: Service) => { await patch('services', s.id, { is_active: !s.is_active }); setMine(await list<Service>('services', { provider_id: user!.id })); };

        return (
          <div className="pt-5">
            <div className="flex items-center gap-4">
              <Avatar p={profile} size={72} />
              <div className="min-w-0"><h1 className="truncate text-xl font-extrabold">{profile.full_name || 'Pengguna baru'}</h1><div className="mt-1 flex flex-wrap gap-1.5"><NewBadge p={profile} /><TrustBadge p={profile} /></div>
                <label className="mt-2 inline-block cursor-pointer text-xs text-gold underline">{profile.avatar_url ? 'Ganti foto' : 'Unggah foto profil'}<input type="file" accept="image/*" className="hidden" onChange={(e) => photo(e.target.files?.[0])} /></label></div>
            </div>

            {c.missing.length > 0 && (
              <div className="card mt-4 border-red-500/50">
                <p className="font-semibold text-red-300">Data wajib belum lengkap</p>
                <p className="mt-1 text-xs text-white/70">Sebelum bisa menerbitkan jasa, mengirim penawaran, atau memasang permintaan, lengkapi:</p>
                <ul className="mt-2 text-sm text-red-200">{c.missing.map((m) => <li key={m.key}>• {m.label}</li>)}</ul>
              </div>
            )}

            <div className="card mt-4">
              <div className="flex items-center justify-between"><p className="font-semibold">Kelengkapan profil</p><b className={c.canPublish ? 'text-emerald-300' : 'text-amber-300'}>{c.pct}%</b></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg"><div className={`h-full ${c.canPublish ? 'bg-primary' : 'bg-gold'}`} style={{ width: `${c.pct}%` }} /></div>
              <ul className="mt-3 space-y-1 text-xs">{c.items.map((i) => <li key={i.key} className={i.ok ? 'text-emerald-300' : i.req ? 'text-red-300' : 'text-white/60'}>{i.ok ? '✓' : '○'} {i.label}{i.req ? ' (wajib)' : ''}</li>)}</ul>
              <p className="mt-3 text-xs text-white/50">{c.canPublish ? 'Semua syarat terpenuhi. Kamu bisa menerbitkan jasa dan mengirim penawaran.' : 'Isi semua data wajib dan capai minimal 80%.'}</p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-white/60">
                <div><b className="block text-base text-white">{trustScore(profile)}</b>Trust</div><div><b className="block text-base text-white">{ageDays(profile)}</b>Hari</div>
                <div><b className="block text-base text-white">{profile.completed_orders}</b>Selesai</div><div><b className="block text-base text-white">{avgRating(profile) ? avgRating(profile).toFixed(1) : '-'}</b>Rating</div>
              </div>
            </div>

            <label className="label">Nama lengkap</label><input className="input" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
            <label className="label">Bio singkat (min. 10 karakter)</label><textarea className="input" rows={3} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
            <label className="label">Alamat email<Req /></label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nama@email.com" />
            <label className="label">Alamat domisili<Req /></label><LocationPicker value={loc} onChange={setLoc} />
            <label className="label">Link sosial media / portofolio (Instagram, LinkedIn, TikTok, GitHub, website)</label><input className="input" value={f.social_url} onChange={(e) => setF({ ...f, social_url: e.target.value })} placeholder="https://instagram.com/namamu" />

            <label className="label">Nomor WhatsApp aktif<Req /></label>
            <input className="input" inputMode="tel" value={f.wa} onChange={(e) => { setF({ ...f, wa: e.target.value }); setSent(false); setConfirmed(false); }} placeholder="08123456789" />
            <p className="mt-1 text-xs text-white/50">Nomor tidak pernah tampil di halaman publik; hanya pengguna yang sudah masuk yang bisa menghubungi lewat tombol WhatsApp.</p>
            {waOk ? <p className="mt-2 text-sm text-emerald-300">✓ WhatsApp terkonfirmasi</p> : f.wa.replace(/\D/g, '').length >= 9 && (
              <div className="card mt-2">
                <p className="text-sm font-semibold">Konfirmasi nomor (gratis)</p>
                <p className="mt-1 text-xs text-white/70">1) Simpan profil dulu. 2) Ketuk tombol di bawah, kirim pesan berisi kode ke nomormu sendiri. 3) Centang konfirmasi.</p>
                <a className="btn-ghost mt-2 w-full" href={waLink(f.wa, `Konfirmasi JasaKita: ${code}`)} target="_blank" rel="noopener noreferrer" onClick={() => setSent(true)}>Kirim kode {code} via WhatsApp</a>
                {sent && <label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-[#2A8C78]" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />Saya sudah mengirim pesan itu dan nomor ini milik saya.</label>}
                <button className="btn-primary mt-2 w-full" disabled={!sent || !confirmed || busy || waChanged} onClick={confirmWa}>Konfirmasi WhatsApp</button>
                {waChanged && <p className="mt-1 text-[11px] text-amber-300">Nomor berubah: tekan Simpan Profil dulu.</p>}
              </div>
            )}

            {msg && <p className="mt-4 text-sm text-emerald-300">{msg}</p>}
            <button className="btn-primary mt-4 w-full" disabled={busy} onClick={() => save()}>{busy ? 'Menyimpan…' : 'Simpan Profil'}</button>

            <div className="mt-8 flex items-center justify-between"><h2 className="font-bold">Jasa saya</h2><Link href="/jasa/baru" className="text-sm text-gold">+ Tambah jasa</Link></div>
            <div className="mt-3 space-y-2">
              {mine.map((s) => (
                <div key={s.id} className="card flex items-center gap-3 !p-3"><Link href={`/cari/${s.id}`} className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{s.title}</p><p className="text-xs text-white/50">{warrantyLabel(s.warranty_days)}</p></Link>
                  <button className={`chip ${s.is_active ? '!text-emerald-300' : ''}`} onClick={() => toggle(s)}>{s.is_active ? 'Aktif' : 'Nonaktif'}</button></div>
              ))}
              {!mine.length && <p className="text-sm text-white/50">Belum ada jasa yang diterbitkan.</p>}
            </div>

            <div className="mt-8 space-y-2">
              <button className="btn-ghost w-full" onClick={signOut}>Keluar</button>
              {isDemo && <button className="w-full text-center text-xs text-white/40 underline" onClick={() => { if (window.confirm('Reset semua data demo ke kondisi awal?')) { resetDemo(); location.href = '/'; } }}>Reset data demo</button>}
            </div>
          </div>
        );
      })()}
    </RequireAuth>
  );
}
