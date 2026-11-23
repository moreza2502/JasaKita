'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { isDemo } from '@/lib/supabase';
import { useQ } from '@/lib/hooks';

export default function Masuk() {
  const { signIn, signUp, google, user } = useAuth();
  const router = useRouter();
  const mode0 = useQ('mode'); const next = useQ('next');
  const [mode, setMode] = useState<'masuk' | 'daftar'>('masuk');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (mode0 === 'daftar') setMode('daftar'); }, [mode0]);
  useEffect(() => { if (user) router.replace(next && next.startsWith('/') ? next : '/'); }, [user, next, router]);

  async function submit() {
    setErr(''); setInfo(''); setBusy(true);
    if (mode === 'daftar' && name.trim().length < 3) { setErr('Isi nama lengkap.'); setBusy(false); return; }
    const r = mode === 'masuk' ? await signIn(email, pw) : await signUp(name.trim(), email, pw);
    if (r.error) setErr(r.error); if (r.info) setInfo(r.info); setBusy(false);
  }
  async function g() { const r = await google(); if (r.error) setErr(r.error); }
  const demo = (e: string, p: string) => { setMode('masuk'); setEmail(e); setPw(p); };

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-extrabold">{mode === 'masuk' ? 'Masuk ke JasaKita' : 'Daftar gratis'}</h1>
      <p className="mt-1 text-sm text-white/60">Satu akun bisa mencari jasa sekaligus menawarkan jasa.</p>
      <button className="btn-ghost mt-5 w-full" onClick={g}><span className="font-bold">G</span> Lanjutkan dengan Google</button>
      <div className="my-4 flex items-center gap-3 text-xs text-white/40"><span className="h-px flex-1 bg-line" />atau email<span className="h-px flex-1 bg-line" /></div>
      {mode === 'daftar' && <><label className="label !mt-0">Nama lengkap</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sesuai identitas aslimu" /></>}
      <label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
      <label className="label">Kata sandi</label><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Minimal 6 karakter" onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {err && <p className="mt-3 text-sm text-red-300">{err}</p>}{info && <p className="mt-3 text-sm text-emerald-300">{info}</p>}
      <button className="btn-primary mt-5 w-full" disabled={busy} onClick={submit}>{busy ? 'Memproses…' : mode === 'masuk' ? 'Masuk' : 'Daftar'}</button>
      <button className="mt-4 w-full text-center text-sm text-gold" onClick={() => { setMode(mode === 'masuk' ? 'daftar' : 'masuk'); setErr(''); }}>
        {mode === 'masuk' ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
      </button>
      {isDemo && (
        <div className="card mt-6">
          <p className="text-sm font-semibold">Akun demo (ketuk untuk mengisi)</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button className="chip" onClick={() => demo('demo@jasakita.id', 'demo1234')}>Pembeli · profil 60%</button>
            <button className="chip" onClick={() => demo('budi@jasakita.id', 'demo1234')}>Penyedia · profil 100%</button>
            <button className="chip" onClick={() => demo('admin@jasakita.id', 'admin1234')}>Admin</button>
          </div>
        </div>
      )}
    </div>
  );
}
