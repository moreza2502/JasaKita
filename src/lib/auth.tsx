'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSupabase, isDemo } from './supabase';
import { get, insert, list } from './db';
import type { Profile } from './types';

type U = { id: string; email: string } | null;
type R = { error?: string; info?: string };
interface Ctx {
  user: U; profile: Profile | null; whatsapp: string; loading: boolean;
  refresh: () => Promise<void>;
  signIn: (e: string, p: string) => Promise<R>;
  signUp: (n: string, e: string, p: string) => Promise<R>;
  google: () => Promise<R>;
  signOut: () => Promise<void>;
}
const C = createContext<Ctx>(null as any);
export const useAuth = () => useContext(C);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<U>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [whatsapp, setWa] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (u: U) => {
    setUser(u);
    if (!u) { setProfile(null); setWa(''); return; }
    let p = await get<Profile>('profiles', u.id);
    if (!p && !isDemo) { await new Promise((r) => setTimeout(r, 900)); p = await get<Profile>('profiles', u.id); }
    setProfile(p);
    const c = await get<any>('contacts', u.id);
    setWa(c?.whatsapp || '');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (isDemo) {
          const s = localStorage.getItem('jk_session');
          await load(s ? JSON.parse(s) : null);
        } else {
          const sb = getSupabase();
          const { data } = await sb.auth.getSession();
          const u = data.session?.user;
          await load(u ? { id: u.id, email: u.email || '' } : null);
          sb.auth.onAuthStateChange((_e, sess) => {
            const x = sess?.user;
            setTimeout(() => load(x ? { id: x.id, email: x.email || '' } : null), 0);
          });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [load]);

  const refresh = useCallback(async () => { if (user) await load(user); }, [user, load]);

  async function signIn(email: string, password: string): Promise<R> {
    if (isDemo) {
      const found = (await list<any>('users', { email: email.trim().toLowerCase() }))[0];
      if (!found || found.password !== password) return { error: 'Email atau kata sandi salah.' };
      const u = { id: found.id, email: found.email };
      localStorage.setItem('jk_session', JSON.stringify(u)); await load(u); return {};
    }
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    return error ? { error: error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : error.message } : {};
  }

  async function signUp(name: string, email: string, password: string): Promise<R> {
    if (password.length < 6) return { error: 'Kata sandi minimal 6 karakter.' };
    if (isDemo) {
      const e = email.trim().toLowerCase();
      if ((await list<any>('users', { email: e })).length) return { error: 'Email sudah terdaftar.' };
      const u = await insert<any>('users', { email: e, password });
      await insert('profiles', { id: u.id, full_name: name, avatar_url: '', bio: '', province: '', city: '', district: '', social_url: '', wa_verified: false, status: 'ACTIVE', is_admin: false, completed_orders: 0, rating_sum: 0, rating_count: 0 });
      const s = { id: u.id, email: e }; localStorage.setItem('jk_session', JSON.stringify(s)); await load(s); return {};
    }
    const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) return { error: error.message };
    if (!data.session) return { info: 'Pendaftaran berhasil. Cek email kamu untuk konfirmasi, lalu masuk.' };
    return {};
  }

  async function google(): Promise<R> {
    if (isDemo) return { error: 'Mode demo: login Google aktif setelah Supabase dikonfigurasi. Gunakan akun demo di bawah.' };
    const { error } = await getSupabase().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/profil' } });
    return error ? { error: error.message } : {};
  }

  async function signOut() {
    if (isDemo) localStorage.removeItem('jk_session'); else await getSupabase().auth.signOut();
    await load(null);
  }

  return <C.Provider value={{ user, profile, whatsapp, loading, refresh, signIn, signUp, google, signOut }}>{children}</C.Provider>;
}
