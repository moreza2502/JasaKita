# JasaKita - Marketplace Jasa Tanpa Komisi (PWA)

Next.js 14 (App Router) + TypeScript + Tailwind CSS, Supabase (gratis) dan Google Gemini (gratis).

## Jalankan cepat (Mode Demo, tanpa akun apa pun)
1. Install Node.js LTS dari https://nodejs.org
2. Di folder proyek: `npm install` lalu `npm run dev`
3. Buka http://localhost:3000

Mode demo otomatis aktif jika `.env.local` tidak ada / kosong: data contoh Indonesia, AI simulasi, data disimpan di browser.

Akun demo: `demo@jasakita.id / demo1234` (pembeli, profil 60%), `budi@jasakita.id / demo1234` (penyedia 100%), `admin@jasakita.id / admin1234` (admin).

## Mode Live (Supabase + Gemini)
1. Salin `.env.example` menjadi `.env.local`, isi 3 variabel.
2. Supabase SQL Editor: jalankan seluruh `supabase/schema.sql`.
3. Supabase > Authentication > Providers > Google: aktifkan (butuh Client ID/Secret dari Google Cloud Console, gratis). Tambahkan Redirect URL aplikasi di Authentication > URL Configuration.
4. (Disarankan saat uji coba) Authentication > Providers > Email: matikan "Confirm email".
5. Daftar di aplikasi, lalu jalankan SQL di baris terakhir `schema.sql` untuk menjadikan dirimu admin.
6. Restart `npm run dev`.

## Uji PWA / Install
`npm run build && npm start` (service worker hanya aktif di mode produksi). Android: banner "Install Aplikasi". iPhone: Safari > Bagikan > Tambahkan ke Layar Utama. Install via HP butuh HTTPS (deploy ke Vercel/Cloudflare Pages).

## Deploy gratis (Vercel)
Upload proyek ke GitHub, import di vercel.com, tambahkan 3 environment variable, Deploy.

## Catatan keamanan
- WhatsApp disimpan di tabel `contacts` terpisah, hanya terbaca oleh pengguna login.
- Gerbang profil 80% dipaksa di database (RLS), bukan hanya di UI.
- Log AI Content Guard ditulis dari klien; untuk produksi ketat, pindahkan penulisan log ke server (service role).
- Data wilayah di `src/lib/locations.ts` hanya contoh; tambahkan provinsi/kota/kecamatan lain.
