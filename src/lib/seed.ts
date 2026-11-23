import { svgAvatar } from './format';
const ago = (d: number) => new Date(Date.now() - d * 864e5).toISOString();
const COL = ['#2A8C78', '#1F6F8B', '#8B5E1F', '#6B4E9B', '#9B4E5E', '#3F7D4A'];
let ci = 0;
const P = (id: string, name: string, bio: string, province: string, city: string, district: string, age: number, done: number, rc: number, rs: number, x: any = {}) => ({
  id, full_name: name, avatar_url: svgAvatar(name, COL[ci++ % COL.length]), bio, province, city, district,
  social_url: 'https://instagram.com/' + id.slice(2), wa_verified: true, status: 'ACTIVE', is_admin: false,
  completed_orders: done, rating_count: rc, rating_sum: rs, created_at: ago(age), ...x,
});
const S = (id: string, prov: string, cat: string, sub: string, title: string, description: string, h: number | null, d: number | null, p: number | null,
  wd: number, wdesc: string, mode: string, province: string, city: string, district: string, tags: string[], age: number, x: any = {}) => ({
  id, provider_id: prov, category: cat, subcategory: sub, title, description, price_hourly: h, price_daily: d, price_project: p,
  warranty_days: wd, warranty_desc: wdesc, mode, province, city, district, tags, is_active: true, created_at: ago(age), ...x,
});
const R = (id: string, buyer: string, title: string, description: string, category: string, mode: string, province: string, city: string, district: string, pm: string, budget: number, age: number) =>
  ({ id, buyer_id: buyer, title, description, category, mode, province, city, district, pricing_model: pm, budget, status: 'OPEN', created_at: ago(age) });

export function seed() {
  const profiles = [
    P('u-budi', 'Budi Santoso', 'Tukang bangunan berpengalaman 15 tahun. Renovasi, cat, atap bocor, rapi dan tepat waktu.', 'Jawa Barat', 'Kota Depok', 'Sawangan', 400, 42, 41, 197),
    P('u-hendra', 'Hendra Gunawan', 'Spesialis keramik dan instalasi listrik rumah tangga di wilayah Bekasi dan sekitarnya.', 'Jawa Barat', 'Kota Bekasi', 'Bekasi Selatan', 250, 18, 17, 79),
    P('u-agus', 'Agus Pratama', 'Teknisi AC bersertifikat. Cuci, isi freon, pasang dan perbaikan untuk rumah dan kantor.', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', 520, 96, 90, 432),
    P('u-sari', 'Sari Wulandari', 'Akuntan dan konsultan pajak. Melayani UMKM dan freelancer, online maupun tatap muka.', 'Jawa Barat', 'Kota Bandung', 'Coblong', 300, 27, 25, 118),
    P('u-rizky', 'Rizky Ramadhan', 'Web developer dan IT support. Membangun website UMKM, toko online, dan jaringan kantor.', 'DI Yogyakarta', 'Kabupaten Sleman', 'Depok', 200, 21, 20, 96),
    P('u-dewi', 'Dewi Lestari', 'Digital marketer dan sales freelance. Kelola media sosial, iklan Meta, dan penjualan B2B.', 'Jawa Timur', 'Kota Surabaya', 'Gubeng', 150, 12, 11, 51),
    P('u-joko', 'Joko Baru', 'Teknisi AC panggilan area Bekasi Utara, harga bersahabat.', 'Jawa Barat', 'Kota Bekasi', 'Bekasi Utara', 5, 0, 0, 0, { social_url: '' }),
    P('u-demo', 'Demo Pengguna', 'Akun demo untuk mencoba JasaKita.', 'Jawa Barat', 'Kota Depok', 'Beji', 40, 0, 0, 0, { avatar_url: '', social_url: '' }),
    P('u-admin', 'Admin JasaKita', 'Administrator platform JasaKita.', 'DKI Jakarta', 'Jakarta Pusat', 'Menteng', 700, 0, 0, 0, { is_admin: true }),
    P('u-scam', 'Promo Gila Service', 'Murah banget transfer dulu.', 'DKI Jakarta', 'Jakarta Utara', 'Penjaringan', 12, 0, 0, 0, { status: 'SUSPENDED', social_url: '' }),
  ];
  const wa = ['081211110001', '081211110002', '081211110003', '081211110004', '081211110005', '081211110006', '081211110007', '081211110008', '081211110009', '081211110010'];
  const contacts = profiles.map((p, i) => ({ id: p.id, whatsapp: wa[i] }));
  const users = [
    { id: 'u-demo', email: 'demo@jasakita.id', password: 'demo1234' },
    { id: 'u-budi', email: 'budi@jasakita.id', password: 'demo1234' },
    { id: 'u-admin', email: 'admin@jasakita.id', password: 'admin1234' },
  ];
  const services = [
    S('s1', 'u-budi', 'Tukang Bangunan', 'Atap & Kanopi', 'Perbaikan Atap Bocor & Renovasi Rumah', 'Melayani perbaikan atap bocor, plafon, dinding retak, hingga renovasi ringan. Material bisa dibawa sendiri atau dibelikan. Tim 2-3 orang, kerja rapi dan bersih.', 60000, 250000, 1500000, 30, 'Perbaikan ulang gratis jika kebocoran atau retakan muncul lagi akibat kesalahan pengerjaan selama 30 hari.', 'ONSITE', 'Jawa Barat', 'Kota Depok', 'Sawangan', ['atap bocor', 'renovasi', 'plafon'], 20),
    S('s2', 'u-budi', 'Tukang Bangunan', 'Pengecatan', 'Cat Tembok Interior & Eksterior', 'Pengecatan rumah, kamar, hingga ruko. Termasuk dempul, amplas, dan cat dasar. Hasil halus tanpa belang.', null, 280000, 2500000, 14, 'Touch-up gratis untuk cat mengelupas atau belang dalam 14 hari.', 'ONSITE', 'Jawa Barat', 'Kota Depok', 'Beji', ['cat', 'tembok', 'ruko'], 35),
    S('s3', 'u-hendra', 'Tukang Bangunan', 'Keramik & Lantai', 'Pasang Keramik & Granit Lantai', 'Pemasangan keramik, granit, dan nat rapi. Harga borongan dihitung per ruangan, survei lokasi gratis.', null, 300000, 3500000, 14, 'Perbaikan keramik terangkat atau nat retak gratis selama 14 hari.', 'ONSITE', 'Jawa Barat', 'Kota Bekasi', 'Bekasi Selatan', ['keramik', 'granit', 'lantai'], 30),
    S('s4', 'u-hendra', 'Tukang Bangunan', 'Listrik', 'Instalasi Listrik & Perbaikan Korsleting', 'Tambah titik lampu, ganti MCB, cek korsleting, dan instalasi listrik rumah baru. Menggunakan kabel standar SNI.', 75000, null, 800000, 7, 'Garansi 7 hari untuk titik instalasi yang kami kerjakan.', 'ONSITE', 'Jawa Barat', 'Kota Bekasi', 'Jatiasih', ['listrik', 'korsleting', 'mcb'], 18),
    S('s5', 'u-agus', 'Service AC', 'Cuci AC', 'Cuci AC & Isi Freon Jakarta Selatan', 'Cuci AC split semua merek, cek tekanan freon, dan tambah freon bila perlu. Datang ke rumah atau kantor, peralatan lengkap.', 75000, null, 85000, 14, 'Garansi 14 hari: jika AC kembali bocor atau kurang dingin setelah dicuci, kami datang lagi tanpa biaya.', 'ONSITE', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', ['cuci ac', 'freon', 'ac bocor'], 10),
    S('s6', 'u-agus', 'Service AC', 'Pasang AC', 'Pasang AC Baru & Bongkar Pasang', 'Pemasangan AC baru lengkap pipa, bracket, dan vakum. Bisa juga bongkar pasang saat pindahan.', null, 400000, 350000, 30, 'Garansi pemasangan 30 hari untuk kebocoran pipa dan instalasi.', 'ONSITE', 'DKI Jakarta', 'Jakarta Selatan', 'Cilandak', ['pasang ac', 'bongkar pasang'], 25),
    S('s7', 'u-sari', 'Jasa Accounting & Pajak', 'Pembukuan', 'Pembukuan Bulanan UMKM', 'Pencatatan transaksi, laporan laba rugi, dan neraca sederhana tiap bulan. Bisa online lewat Google Sheets atau tatap muka di Bandung.', 150000, null, 750000, 14, 'Revisi laporan gratis jika ada selisih pencatatan dalam 14 hari setelah laporan diterima.', 'BOTH', 'Jawa Barat', 'Kota Bandung', 'Coblong', ['pembukuan', 'umkm', 'laporan keuangan'], 28),
    S('s8', 'u-sari', 'Jasa Accounting & Pajak', 'Laporan Pajak / SPT', 'Lapor SPT Tahunan Pribadi & Badan', 'Bantu hitung dan lapor SPT Tahunan untuk karyawan, freelancer, dan CV/PT kecil. 100% online.', null, null, 250000, 7, 'Pendampingan gratis 7 hari jika ada surat klarifikasi dari KPP terkait laporan yang kami buat.', 'REMOTE', 'Jawa Barat', 'Kota Bandung', 'Coblong', ['spt', 'pajak', 'freelancer'], 15),
    S('s9', 'u-rizky', 'Web & IT Support', 'Pembuatan Website', 'Website UMKM & Toko Online', 'Pembuatan company profile atau toko online responsif, termasuk domain dan hosting tahun pertama. Dikerjakan 7-14 hari.', null, 400000, 2500000, 30, 'Perbaikan bug gratis selama 30 hari setelah website tayang.', 'REMOTE', 'DI Yogyakarta', 'Kabupaten Sleman', 'Depok', ['website', 'toko online', 'umkm'], 22),
    S('s10', 'u-rizky', 'Web & IT Support', 'IT Support', 'IT Support & Setup Jaringan Kantor', 'Setup WiFi kantor, printer, backup data, dan troubleshooting komputer. Datang ke lokasi area Sleman atau remote.', 100000, 600000, null, 14, 'Garansi 14 hari untuk konfigurasi jaringan yang dikerjakan.', 'BOTH', 'DI Yogyakarta', 'Kabupaten Sleman', 'Mlati', ['wifi', 'jaringan', 'komputer'], 12),
    S('s11', 'u-dewi', 'Freelance Sales Marketing', 'Social Media', 'Kelola Instagram & Iklan Meta Ads', 'Perencanaan konten, desain feed, caption, dan pengelolaan iklan Meta Ads untuk bisnis lokal. Laporan performa mingguan.', null, 350000, 2000000, 14, 'Revisi konten tanpa biaya selama 14 hari setelah paket selesai.', 'REMOTE', 'Jawa Timur', 'Kota Surabaya', 'Gubeng', ['instagram', 'meta ads', 'konten'], 14),
    S('s12', 'u-dewi', 'Freelance Sales Marketing', 'Sales B2B', 'Sales Freelance B2B & Telemarketing', 'Mencari prospek, follow up calon pelanggan, dan closing untuk produk atau jasa Anda. Laporan progres harian.', 50000, 300000, null, 0, 'Tidak ada garansi hasil penjualan; laporan progres harian disertakan sebagai bentuk transparansi.', 'REMOTE', 'Jawa Timur', 'Kota Surabaya', 'Rungkut', ['sales', 'telemarketing', 'b2b'], 8),
    S('s13', 'u-joko', 'Service AC', 'Perbaikan AC', 'Servis AC Panggilan Bekasi Utara', 'Servis AC bocor, tidak dingin, dan cuci AC. Akun baru, harga promo perkenalan.', null, null, 65000, 7, 'Garansi 7 hari untuk pekerjaan cuci AC.', 'ONSITE', 'Jawa Barat', 'Kota Bekasi', 'Bekasi Utara', ['servis ac', 'ac bocor'], 4),
    S('s14', 'u-scam', 'Lainnya', 'Jasa Lain (legal)', 'Servis Super Murah Transfer Dulu', 'Layanan murah, transfer DP penuh dulu.', null, null, 10000, 0, 'Tidak ada.', 'REMOTE', 'DKI Jakarta', 'Jakarta Utara', 'Penjaringan', ['murah'], 10, { is_active: false }),
  ];
  const requests = [
    R('r1', 'u-demo', 'Atap rumah bocor di Sawangan', 'Atap bocor di dua titik (kamar dan dapur). Genteng tanah liat. Butuh survei dulu lalu perbaikan.', 'Tukang Bangunan', 'ONSITE', 'Jawa Barat', 'Kota Depok', 'Sawangan', 'PROJECT', 1500000, 1),
    R('r2', 'u-dewi', 'Akuntan untuk laporan keuangan toko online', 'Butuh rekap penjualan marketplace dan laporan laba rugi 6 bulan terakhir. Bisa dikerjakan online.', 'Jasa Accounting & Pajak', 'REMOTE', '', '', '', 'PROJECT', 1000000, 2),
    R('r3', 'u-rizky', 'Cuci 3 unit AC kantor', 'Tiga AC split 1 PK di kantor kecil. Dikerjakan hari Sabtu.', 'Service AC', 'ONSITE', 'DKI Jakarta', 'Jakarta Selatan', 'Pasar Minggu', 'DAILY', 500000, 3),
    R('r4', 'u-demo', 'Landing page produk skincare', 'Butuh satu halaman landing page dengan tombol order WhatsApp dan galeri foto produk.', 'Web & IT Support', 'REMOTE', '', '', '', 'PROJECT', 1200000, 4),
    R('r5', 'u-budi', 'Pasang CCTV 4 titik di ruko', 'Pemasangan 4 kamera CCTV beserta DVR dan kabel. Ruko 2 lantai.', 'Web & IT Support', 'ONSITE', 'DKI Jakarta', 'Jakarta Barat', 'Kebon Jeruk', 'HOURLY', 800000, 5),
    R('r6', 'u-hendra', 'Freelance sales untuk katering harian', 'Mencari freelance sales untuk menawarkan paket katering kantor di area Surabaya.', 'Freelance Sales Marketing', 'REMOTE', '', '', '', 'DAILY', 300000, 6),
  ];
  const bids = [
    { id: 'b1', request_id: 'r1', provider_id: 'u-budi', pricing_model: 'PROJECT', price: 1400000, duration: '2 hari', warranty_days: 30, warranty_desc: 'Perbaikan ulang gratis jika bocor lagi dalam 30 hari.', note: 'Siap survei besok sore.', status: 'PENDING', created_at: ago(0.5) },
    { id: 'b2', request_id: 'r1', provider_id: 'u-hendra', pricing_model: 'DAILY', price: 300000, duration: '3 hari', warranty_days: 7, warranty_desc: 'Garansi 7 hari untuk titik yang diperbaiki.', note: 'Material dihitung terpisah.', status: 'PENDING', created_at: ago(0.3) },
    { id: 'b3', request_id: 'r3', provider_id: 'u-agus', pricing_model: 'PROJECT', price: 255000, duration: '1 hari', warranty_days: 14, warranty_desc: 'Garansi 14 hari jika AC kembali bocor.', note: '3 unit selesai dalam sehari.', status: 'PENDING', created_at: ago(1) },
  ];
  const orders = [
    { id: 'o1', title: 'Cuci AC 2 unit', service_id: 's5', request_id: null, buyer_id: 'u-demo', provider_id: 'u-agus', pricing_model: 'PROJECT', agreed_price: 170000, dp_percent: 0, payment_terms: 'Lunas setelah pekerjaan selesai', scope: 'Cuci 2 unit AC split 1 PK di rumah, cek freon.', warranty_days: 14, warranty_desc: 'Garansi 14 hari jika AC kembali bocor atau kurang dingin.', status: 'DONE_WARRANTY', buyer_ok: true, provider_ok: true, done_at: ago(3), warranty_ends_at: new Date(Date.now() + 11 * 864e5).toISOString(), claim_note: '', rating: null, review: '', created_at: ago(6) },
    { id: 'o2', title: 'Website portofolio pribadi', service_id: 's9', request_id: null, buyer_id: 'u-demo', provider_id: 'u-rizky', pricing_model: 'PROJECT', agreed_price: 2000000, dp_percent: 50, payment_terms: 'DP 50% di awal, pelunasan 50% setelah website tayang', scope: 'Website 5 halaman: beranda, tentang, portofolio, blog, kontak.', warranty_days: 30, warranty_desc: 'Perbaikan bug gratis 30 hari setelah tayang.', status: 'IN_PROGRESS', buyer_ok: true, provider_ok: true, done_at: null, warranty_ends_at: null, claim_note: '', rating: null, review: '', created_at: ago(5) },
  ];
  const reports = [
    ...[1, 2, 3].map((i) => ({ id: 'rp' + i, reporter_id: ['u-budi', 'u-agus', 'u-sari'][i - 1], target_id: 'u-scam', reason: 'Penipuan: minta transfer penuh lalu menghilang', evidence: 'Chat WhatsApp dan bukti transfer tersedia, nomor tidak aktif setelah pembayaran.', status: 'VALID', created_at: ago(4 + i) })),
    { id: 'rp4', reporter_id: 'u-demo', target_id: 'u-joko', reason: 'Harga tidak sesuai kesepakatan', evidence: 'Minta tambahan biaya di lokasi tanpa pemberitahuan sebelumnya.', status: 'PENDING', created_at: ago(1) },
  ];
  const mod_logs = [
    { id: 'm1', user_id: 'u-scam', kind: 'service', title: 'Servis Super Murah Transfer Dulu', verdict: 'REJECTED', reason: 'Terindikasi penipuan: meminta transfer penuh di muka.', created_at: ago(10) },
    { id: 'm2', user_id: 'u-budi', kind: 'service', title: 'Perbaikan Atap Bocor & Renovasi Rumah', verdict: 'APPROVED', reason: '', created_at: ago(20) },
    { id: 'm3', user_id: 'u-demo', kind: 'request', title: 'Atap rumah bocor di Sawangan', verdict: 'APPROVED', reason: '', created_at: ago(1) },
  ];
  return { profiles, contacts, users, services, requests, bids, orders, reports, mod_logs };
}
