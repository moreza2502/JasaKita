'use client';
import { useEffect, useState } from 'react';
import { GROUPS, type Cat, type Group } from '@/lib/constants';
import { insert, list } from '@/lib/db';
import { useAuth } from '@/lib/auth';

// Pohon kategori = daftar bawaan + kategori usulan yang sudah disetujui Admin
export function useTree(): Group[] {
  const [tree, setTree] = useState<Group[]>(GROUPS);
  useEffect(() => {
    list<any>('category_suggestions', { status: 'APPROVED' }).then((rows) => {
      if (!rows.length) return;
      setTree(GROUPS.map((g) => ({ ...g, cats: [...g.cats, ...rows.filter((r) => r.group_id === g.id).map((r): Cat => ({ name: r.category_name, icon: '✨', items: String(r.items || '').split(',').map((x) => x.trim()).filter(Boolean) }))] })));
    }).catch(() => {});
  }, []);
  return tree;
}

function Tile({ icon, label, sub, badge = 0, onClick }: { icon: string; label: string; sub?: string; badge?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative flex min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-card px-2 py-4 text-center transition hover:border-primary active:scale-95">
      <span className="text-3xl leading-none">{icon}</span>
      <span className="text-[13px] font-semibold leading-tight">{label}</span>
      {sub && <span className="text-[11px] text-white/50">{sub}</span>}
      {badge > 0 && <span className="absolute right-2 top-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-black">{badge}</span>}
    </button>
  );
}
function Back({ onClick, path }: { onClick: () => void; path: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <button type="button" onClick={onClick} className="btn-ghost !px-3 !py-2">‹ Kembali</button>
      <p className="min-w-0 flex-1 truncate text-xs text-white/60">{path}</p>
    </div>
  );
}

// ---- Pemilih untuk penyedia jasa: boleh pilih banyak layanan (multi) atau satu (single) ----
export function CategoryPicker({ value, onChange, multi = true }: { value: string[]; onChange: (items: string[], cats: string[]) => void; multi?: boolean }) {
  const tree = useTree();
  const [gid, setGid] = useState(''); const [cn, setCn] = useState('');
  const group = tree.find((g) => g.id === gid); const cat = group?.cats.find((c) => c.name === cn);
  const catsOf = (items: string[]) => Array.from(new Set(tree.flatMap((g) => g.cats).filter((c) => c.items.some((i) => items.includes(i))).map((c) => c.name)));
  const set = (items: string[]) => onChange(items, catsOf(items));
  const toggle = (i: string) => set(multi ? (value.includes(i) ? value.filter((x) => x !== i) : [...value, i]) : [i]);
  const cnt = (c: Cat) => c.items.filter((i) => value.includes(i)).length;
  const allOn = !!cat && cat.items.every((i) => value.includes(i));

  return (
    <div>
      {value.length > 0 && (
        <div className="card mb-3 !p-3">
          <div className="flex items-center justify-between"><p className="text-xs text-white/60">{value.length} layanan dipilih</p>{multi && <button type="button" className="text-xs text-red-300 underline" onClick={() => set([])}>Hapus semua</button>}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">{value.map((i) => <button type="button" key={i} className="chip !border-primary" onClick={() => toggle(i)}>{i} ✕</button>)}</div>
        </div>
      )}
      {!gid && (
        <>
          <p className="mb-2 text-xs text-white/60">1. Pilih bidang jasa</p>
          <div className="grid grid-cols-2 gap-3">
            {tree.map((g) => <Tile key={g.id} icon={g.icon} label={g.name} sub={`${g.cats.length} kategori`} badge={g.cats.reduce((a, c) => a + cnt(c), 0)} onClick={() => setGid(g.id)} />)}
          </div>
        </>
      )}
      {group && !cat && (
        <>
          <Back onClick={() => setGid('')} path={group.name} />
          <p className="mb-2 text-xs text-white/60">2. Pilih kategori</p>
          <div className="grid grid-cols-2 gap-3">
            {group.cats.map((c) => <Tile key={c.name} icon={c.icon} label={c.name} sub={`${c.items.length} layanan`} badge={cnt(c)} onClick={() => setCn(c.name)} />)}
          </div>
        </>
      )}
      {group && cat && (
        <>
          <Back onClick={() => setCn('')} path={`${group.name} › ${cat.name}`} />
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-white/60">3. {multi ? 'Centang semua layanan yang kamu tawarkan' : 'Pilih satu layanan'}</p>
            {multi && <button type="button" className="text-xs text-gold underline" onClick={() => set(allOn ? value.filter((i) => !cat.items.includes(i)) : Array.from(new Set([...value, ...cat.items])))}>{allOn ? 'Hapus semua' : 'Pilih semua'}</button>}
          </div>
          <div className="space-y-2">
            {cat.items.map((i) => (
              <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-card p-3 has-[:checked]:border-gold">
                <input type={multi ? 'checkbox' : 'radio'} name="item" className="h-4 w-4 accent-[#EAB308]" checked={value.includes(i)} onChange={() => toggle(i)} />
                <span className="text-sm">{i}</span>
              </label>
            ))}
          </div>
          <button type="button" className="btn-ghost mt-3 w-full" onClick={() => setCn('')}>Selesai, pilih kategori lain</button>
        </>
      )}
      <SuggestForm />
    </div>
  );
}

// ---- Penelusuran untuk pencari jasa: mengerucut Bidang > Kategori > Layanan ----
export interface Flt { g?: string; c?: string; i?: string }
export function CategoryBrowse({ value, onChange }: { value: Flt; onChange: (f: Flt) => void }) {
  const tree = useTree();
  const group = tree.find((g) => g.id === value.g); const cat = group?.cats.find((c) => c.name === value.c);
  const back = () => onChange(value.i ? { g: value.g, c: value.c } : value.c ? { g: value.g } : {});
  return (
    <div>
      {!group && <div className="grid grid-cols-2 gap-3">{tree.map((g) => <Tile key={g.id} icon={g.icon} label={g.name} sub={`${g.cats.length} kategori`} onClick={() => onChange({ g: g.id })} />)}</div>}
      {group && (
        <>
          <Back onClick={back} path={[group.name, cat?.name, value.i].filter(Boolean).join(' › ')} />
          {!cat && <div className="grid grid-cols-2 gap-3">{group.cats.map((c) => <Tile key={c.name} icon={c.icon} label={c.name} sub={`${c.items.length} layanan`} onClick={() => onChange({ g: group.id, c: c.name })} />)}</div>}
          {cat && <div className="flex flex-wrap gap-2">{cat.items.map((i) => <button type="button" key={i} onClick={() => onChange({ g: group.id, c: cat.name, i: value.i === i ? undefined : i })} className={`chip !py-2 text-[13px] ${value.i === i ? '!border-gold !text-gold' : ''}`}>{i}</button>)}</div>}
          <button type="button" className="mt-3 text-xs text-red-300 underline" onClick={() => onChange({})}>Hapus filter kategori</button>
        </>
      )}
    </div>
  );
}

// ---- Usulan kategori baru (pengguna) / tambah kategori langsung (admin) ----
export function SuggestForm({ asAdmin = false, onDone }: { asAdmin?: boolean; onDone?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(asAdmin); const [gid, setGid] = useState('F'); const [name, setName] = useState(''); const [items, setItems] = useState(''); const [msg, setMsg] = useState('');
  if (!user) return null;
  async function send() {
    if (name.trim().length < 4) return setMsg('Nama kategori minimal 4 karakter.');
    if (!items.split(',').some((x) => x.trim().length >= 3)) return setMsg('Isi minimal satu layanan (pisahkan dengan koma).');
    try {
      await insert('category_suggestions', { user_id: user!.id, group_id: gid, category_name: name.trim(), items: items.trim(), status: asAdmin ? 'APPROVED' : 'PENDING' });
      setMsg(asAdmin ? 'Kategori ditambahkan dan langsung tampil.' : 'Usulan terkirim ke Admin. Terima kasih!'); setName(''); setItems(''); onDone?.();
    } catch (e: any) { setMsg(e.message); }
  }
  return (
    <div className="mt-5 border-t border-line pt-4">
      {!asAdmin && <button type="button" className="text-sm text-gold underline" onClick={() => setOpen(!open)}>Kategori yang kamu cari belum ada? Usulkan ke Admin</button>}
      {open && (
        <div className="card mt-3">
          <label className="label !mt-0">Bidang</label>
          <select className="input" value={gid} onChange={(e) => setGid(e.target.value)}>{GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
          <label className="label">Nama kategori</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Reparasi Drone" />
          <label className="label">Layanan di dalamnya (pisahkan dengan koma)</label><textarea className="input" rows={2} value={items} onChange={(e) => setItems(e.target.value)} placeholder="Servis Drone, Kalibrasi Gimbal" />
          {msg && <p className="mt-2 text-sm text-emerald-300">{msg}</p>}
          <button type="button" className="btn-primary mt-3 w-full" onClick={send}>{asAdmin ? 'Tambah Kategori' : 'Kirim Usulan'}</button>
        </div>
      )}
    </div>
  );
}
