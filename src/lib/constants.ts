export interface Cat { name: string; icon: string; items: string[]; extra?: boolean }
export interface Group { id: string; name: string; icon: string; cats: Cat[] }
const C = (name: string, icon: string, items: string[], extra = false): Cat => ({ name, icon, items, extra });

export const GROUPS: Group[] = [
  { id: 'A', name: 'Perbaikan, Rumah & Teknis', icon: '🛠️', cats: [
    C('Servis Elektronik', '🔌', ['Cuci & Servis AC', 'Servis Kulkas & Freezer', 'Servis Mesin Cuci', 'Servis TV & Perangkat Audio', 'Servis Kipas Angin & Dispenser', 'Servis Pompa Air', 'Servis Water Heater & Kompor Gas', 'Servis Microwave & Peralatan Dapur']),
    C('Pertukangan & Listrik', '🔨', ['Instalasi & Perbaikan Listrik', 'Perbaikan Atap & Kebocoran', 'Tukang Ledeng & Pipa Mampet', 'Pengecatan Dinding & Rumah', 'Pemasangan Keramik & Plafon', 'Tukang Las (Pagar, Kanopi & Teralis)', 'Tukang Kayu & Perbaikan Furnitur', 'Renovasi Bangunan Harian']),
    C('Kebersihan & Sanitasi', '🧹', ['Bersih Rumah & Apartemen', 'Bersih Kamar Kost Harian', 'Cuci Sofa, Kasur & Karpet (Sedot Tungau)', 'Sedot WC & Pelancaran Saluran', 'Pengendalian Hama (Pest Control & Fogging)', 'Perawatan Taman & Potong Rumput', 'Poles Lantai Marmer & Granit']),
    C('Asisten Rumah Tangga', '🏠', ['Asisten Rumah Tangga (ART) Harian', 'Asisten Rumah Tangga (ART) Bulanan', 'Jasa Cuci & Setrika Panggilan', 'Juru Masak Rumah Tangga', 'Supir Pribadi Harian', 'Tenaga Keamanan / Penjaga Rumah']),
    C('Komputer, HP & Jaringan', '💻', ['Servis Laptop & Komputer (PC)', 'Instal Ulang Sistem & Pemulihan Data', 'Servis HP & Tablet', 'Instalasi & Pengaturan Wi-Fi / Jaringan', 'Pasang & Perbaikan CCTV', 'Rakit PC & Upgrade Perangkat Keras']),
  ] },
  { id: 'B', name: 'Keluarga, Kesehatan & Perawatan', icon: '🩺', cats: [
    C('Penitipan & Pendampingan', '👶', ['Penitipan Anak & Balita', 'Pengasuh Anak (Babysitter)', 'Pendamping Pasien Rumah Sakit', 'Perawatan Lansia (Home Care)', 'Perawat Medis Panggilan ke Rumah']),
    C('Kecantikan & Perawatan Diri', '💅', ['Penata Rias (Makeup Artist / MUA)', 'Potong Rambut & Creambath Panggilan', 'Perawatan Kuku (Manicure & Pedicure)', 'Perawatan Wajah (Facial) di Rumah', 'Sambung Bulu Mata (Eyelash Extension)']),
    C('Kesehatan & Kebugaran', '💆', ['Pijat Refleksi & Kebugaran Panggilan', 'Pijat Ibu Hamil & Pasca Melahirkan', 'Fisioterapi ke Rumah', 'Bekam & Akupunktur Panggilan', 'Pelatih Kebugaran Pribadi (Personal Trainer)', 'Konseling Psikologi & Keluarga']),
    C('Perawatan Hewan', '🐾', ['Perawatan & Mandi Hewan (Grooming) Panggilan', 'Penitipan Hewan Peliharaan (Pet Hotel)', 'Dokter Hewan Panggilan ke Rumah', 'Pelatihan Hewan Peliharaan', 'Antar-Jemput Hewan Peliharaan']),
  ] },
  { id: 'C', name: 'Transportasi & Otomotif', icon: '🚗', cats: [
    C('Otomotif & Darurat', '🔧', ['Cuci & Salon Mobil/Motor Panggilan', 'Ganti Oli & Aki di Lokasi', 'Servis Motor Panggilan', 'Servis Mobil & Tune-Up Panggilan', 'Tambal Ban & Derek Darurat', 'Pasang Kaca Film & Audio Mobil']),
    C('Pindahan & Angkut Barang', '🚚', ['Jasa Pindahan Rumah & Kantor', 'Jasa Pindahan Kamar Kost', 'Sewa Mobil Pikap + Supir', 'Sewa Truk Engkel / Boks', 'Jasa Tenaga Angkut (Helper)', 'Kurir Barang Besar Dalam Kota']),
    C('Biro Jasa & Perjalanan', '🧳', ['Pengurusan STNK, BPKB & SIM', 'Pengurusan Paspor & Visa', 'Sewa Mobil + Supir Harian', 'Pemandu Wisata Lokal (Tour Guide)', 'Jasa Titip (Jastip) & Belanja Harian']),
  ] },
  { id: 'D', name: 'Bisnis, Keuangan & Digital', icon: '💼', cats: [
    C('Akuntansi & Pajak', '🧾', ['Penyusunan Laporan Keuangan UMKM', 'Jasa Pembukuan Bulanan', 'Pelaporan SPT Tahunan & Masa (PPh/PPN)', 'Konsultasi & Pendampingan Pajak', 'Perhitungan HPP & Audit Internal', 'Pengaturan Sistem Akuntansi']),
    C('Legalitas & Perizinan', '⚖️', ['Pendirian PT, PT Perorangan & CV', 'Pembuatan NIB & Perizinan OSS', 'Pendaftaran Merek Dagang (HAKI)', 'Pengurusan Sertifikat Halal', 'Pengurusan Izin Edar PIRT & BPOM', 'Pembuatan Kontrak & Perjanjian Hukum']),
    C('Desain Grafis & Kreatif', '🎨', ['Desain Logo & Identitas Merek', 'Desain Kemasan (Packaging) & Label', 'Desain Konten Media Sosial', 'Desain Brosur, Spanduk & Katalog', 'Ilustrasi & Karikatur', 'Desain Interior & Arsitektur 3D']),
    C('Website & Aplikasi', '🌐', ['Pembuatan Landing Page Promosi', 'Pembuatan Website Profil Usaha', 'Pembuatan Toko Online (E-Commerce)', 'Pengembangan Aplikasi Android & iOS', 'Pembuatan Sistem Kasir (POS) & Gudang', 'Perbaikan & Pemeliharaan Website']),
    C('Pemasaran Digital', '📣', ['Pengelolaan Akun Media Sosial', 'Jasa Iklan Instagram & Facebook (Meta Ads)', 'Jasa Iklan TikTok & Google (Ads)', 'Optimasi Toko Shopee & Tokopedia', 'Optimasi Mesin Pencari (SEO) & Artikel', 'Pemandu Siaran Langsung (Live Host)']),
    C('Fotografi & Videografi', '📷', ['Foto Produk & Katalog UMKM', 'Editing Video Reels & TikTok', 'Dokumentasi Pernikahan & Lamaran', 'Foto Wisuda & Keluarga', 'Pembuatan Video Profil Perusahaan', 'Jasa Foto & Video Udara (Drone)']),
  ] },
  { id: 'E', name: 'Pendidikan, Acara & Gaya Hidup', icon: '🎉', cats: [
    C('Les Privat & Pelatihan', '📚', ['Les Privat SD, SMP & SMA', 'Guru Mengaji Panggilan', 'Kursus Bahasa Inggris & Bahasa Asing', 'Kursus Musik (Gitar, Piano & Vokal)', 'Pelatihan Komputer & Desain', 'Bimbingan Persiapan Ujian & CPNS']),
    C('Acara & Hiburan', '🎤', ['Penyelenggara Acara (Event & Wedding Organizer)', 'Pembawa Acara (MC)', 'Sewa Tenda, Kursi & Dekorasi', 'Sewa Tata Suara (Sound System) & Pencahayaan', 'Jasa Katering Harian & Prasmanan', 'Hiburan Ulang Tahun (Badut & Sulap)']),
    C('Jahit, Laundry & Perbaikan', '🧵', ['Jahit & Permak Pakaian', 'Laundry Kiloan & Satuan Antar-Jemput', 'Cuci & Cat Ulang Sepatu / Tas', 'Servis Koper & Ritsleting', 'Servis Jam Tangan & Kacamata', 'Pembuatan Seragam & Sablon Kaos']),
    C('Penulisan & Penerjemah', '✍️', ['Penerjemah Tersumpah (Sworn Translator)', 'Penerjemah Bahasa Asing Umum', 'Penyuntingan & Parafrase Karya Ilmiah', 'Pembuatan CV & Surat Lamaran Kerja', 'Penulisan Naskah Iklan (Copywriting)', 'Transkripsi Audio & Subtitle Video']),
  ] },
  // Kategori tambahan sebagai bahan pertimbangan Admin (bisa disetujui / ditambah dari menu Admin > Kategori)
  { id: 'F', name: 'Kategori Tambahan (Usulan)', icon: '✨', cats: [
    C('Penjualan & Sales Freelance', '🤝', ['Sales Freelance B2B', 'Telemarketing & Follow Up Pelanggan', 'Reseller & Dropship Produk', 'Agen Properti & Pemasaran Perumahan'], true),
    C('Pertanian & Perkebunan', '🌾', ['Jasa Tanam & Panen Harian', 'Perawatan Kebun & Pemangkasan Pohon', 'Konsultasi Pertanian Organik', 'Instalasi Irigasi & Greenhouse'], true),
    C('Arsitek & Konstruksi', '🏗️', ['Gambar Kerja & Desain Rumah', 'Pengurusan PBG / IMB', 'Penyusunan RAB & Pengawasan Proyek', 'Jasa Survei & Pengukuran Tanah'], true),
    C('Energi & Panel Surya', '☀️', ['Pasang Panel Surya', 'Instalasi Genset & UPS', 'Audit Hemat Energi Rumah'], true),
    C('Keamanan & Smart Home', '🔐', ['Pasang Smart Lock & Alarm', 'Home Automation & Sensor', 'Pasang Interkom & Video Doorbell'], true),
    C('Daur Ulang & Lingkungan', '♻️', ['Angkut Sampah & Barang Bekas', 'Pembersihan Pasca Renovasi', 'Pengelolaan Limbah & Bank Sampah'], true),
    C('Kerajinan & Seni', '🎭', ['Desain Busana Custom', 'Kerajinan Tangan & Souvenir', 'Lukisan & Mural Dinding', 'Penari & Musisi Panggilan'], true),
  ] },
];
export const WARRANTY_PRESETS = [0, 7, 14, 30];
