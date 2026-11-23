'use client';
import { LOC } from '@/lib/locations';

export interface Loc { province: string; city: string; district: string }
export default function LocationPicker({ value, onChange, any }: { value: Loc; onChange: (v: Loc) => void; any?: boolean }) {
  const cities = value.province ? Object.keys(LOC[value.province] || {}) : [];
  const districts = value.province && value.city ? LOC[value.province]?.[value.city] || [] : [];
  const ph = (t: string) => <option value="">{any ? `Semua ${t}` : `Pilih ${t}`}</option>;
  return (
    <div className="grid gap-2">
      <select className="input" value={value.province} onChange={(e) => onChange({ province: e.target.value, city: '', district: '' })}>
        {ph('Provinsi')}{Object.keys(LOC).map((p) => <option key={p}>{p}</option>)}
      </select>
      <select className="input" value={value.city} disabled={!value.province} onChange={(e) => onChange({ ...value, city: e.target.value, district: '' })}>
        {ph('Kota/Kabupaten')}{cities.map((c) => <option key={c}>{c}</option>)}
      </select>
      <select className="input" value={value.district} disabled={!value.city} onChange={(e) => onChange({ ...value, district: e.target.value })}>
        {ph('Kecamatan')}{districts.map((d) => <option key={d}>{d}</option>)}
      </select>
    </div>
  );
}
