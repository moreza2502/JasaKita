// Contoh data wilayah (ringkas). Tambahkan provinsi/kota/kecamatan lain sesuai kebutuhan.
export const LOC: Record<string, Record<string, string[]>> = {
  'DKI Jakarta': {
    'Jakarta Selatan': ['Kebayoran Baru', 'Cilandak', 'Pasar Minggu', 'Tebet', 'Jagakarsa'],
    'Jakarta Pusat': ['Menteng', 'Tanah Abang', 'Gambir', 'Senen'],
    'Jakarta Barat': ['Kebon Jeruk', 'Grogol Petamburan', 'Cengkareng', 'Kembangan'],
    'Jakarta Timur': ['Jatinegara', 'Duren Sawit', 'Cakung', 'Pulogadung'],
    'Jakarta Utara': ['Kelapa Gading', 'Penjaringan', 'Tanjung Priok'],
  },
  'Jawa Barat': {
    'Kota Depok': ['Sawangan', 'Beji', 'Cimanggis', 'Pancoran Mas', 'Cinere'],
    'Kota Bekasi': ['Bekasi Selatan', 'Bekasi Utara', 'Bekasi Barat', 'Jatiasih'],
    'Kota Bandung': ['Coblong', 'Cicendo', 'Lengkong', 'Buahbatu'],
    'Kota Bogor': ['Bogor Tengah', 'Bogor Barat', 'Tanah Sareal'],
  },
  Banten: {
    'Kota Tangerang Selatan': ['Serpong', 'Pamulang', 'Ciputat', 'Pondok Aren'],
    'Kota Tangerang': ['Cipondoh', 'Karawaci', 'Batuceper'],
  },
  'Jawa Tengah': {
    'Kota Semarang': ['Tembalang', 'Banyumanik', 'Semarang Tengah'],
    'Kota Surakarta': ['Laweyan', 'Banjarsari', 'Jebres'],
  },
  'DI Yogyakarta': {
    'Kabupaten Sleman': ['Depok', 'Mlati', 'Ngaglik', 'Gamping'],
    'Kota Yogyakarta': ['Gondokusuman', 'Umbulharjo', 'Mergangsan'],
  },
  'Jawa Timur': {
    'Kota Surabaya': ['Gubeng', 'Wonokromo', 'Rungkut', 'Sukolilo'],
    'Kota Malang': ['Lowokwaru', 'Klojen', 'Blimbing'],
  },
  Bali: {
    Denpasar: ['Denpasar Selatan', 'Denpasar Barat', 'Denpasar Timur'],
    'Kabupaten Badung': ['Kuta', 'Kuta Utara', 'Mengwi'],
  },
};
