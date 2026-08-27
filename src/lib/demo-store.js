// ===================================================================
// PENYIMPANAN DEMO — data contoh di memori, tanpa database.
// Cocok untuk mencoba alur & tampilan. Data akan ter-reset saat
// server dinyalakan ulang.
//
// Untuk data sungguhan: isi .env (lihat .env.example) dan jalankan
// supabase/schema.sql — aplikasi otomatis beralih ke Supabase.
// ===================================================================

const pengaturan = {
  nama_kegiatan: "Maulid Nabi ﷺ 1447 H",
  hijriah: "12 Rabiul Awal 1447 H",
  penyelenggara: "[Nama RT/RW · Kampung] — ganti di Pengaturan Admin",
  penyelenggara_singkat: "RT/RW · Kampung Anda",
  lokasi_acara: "Balai Warga & Masjid Al-Ikhlas",
  tanggal_acara: "2026-09-04T08:00:00+07:00", // konfirmasi tanggal panitia
  kontak_wa: "628123456789", // nomor bendahara (format 62…)
};

// ---- Daftar warga (48 KK) — nominal ancalah bertingkat hasil musyawarah
const NAMA_WARGA = [
  "Asep Saepudin", "Euis Komariah", "Dedi Mulyadi", "Yuyun Kartini",
  "Ujang Suryana", "Enung Nurhayati", "Wawan Setiawan", "Imas Masitoh",
  "Engkus Kusnadi", "Nani Sunani", "Cecep Ruhimat", "Ai Kurnia",
  "Dudung Abdullah", "Teti Rohaeti", "Aan Supriatna", "Sari Wulandari",
  "Oding Sutisna", "Lilis Suryani", "Memet Hidayat", "Iis Aisyah",
  "Kokom Komalasari", "Iwan Ridwan", "Yani Handayani", "Adang Samsudin",
  "Ruwati Rahayu", "Sauqi Ramdani", "Enung Saenah", "Yayat Ruhiyat",
  "Oneng Nurjanah", "Dede Supriadi", "Eka Fitriani", "Hasim Hasbullah",
  "Icih Icihariah", "Maman Suherman", "Nurhayati", "Rizki Alfarizi",
  "Siti Aminah", "Tati Sumiati", "Ucu Sutarna", "Wahyu Hidayat",
  "Yosep Yosepa", "Zaenal Abidin", "Euis Herlina", "Budi Santoso",
  "Cucu Suryana", "Deden Deni", "Farhan Maulana", "Gugun Gunawan",
];

function ancalahUntuk(i) {
  if (i < 20) return 50000;
  if (i < 38) return 100000;
  if (i < 44) return 150000;
  return 200000;
}

const TANGGAL_BAYAR = [
  "2026-08-20", "2026-08-21", "2026-08-21", "2026-08-22", "2026-08-22",
  "2026-08-23", "2026-08-23", "2026-08-24", "2026-08-24", "2026-08-25",
  "2026-08-25", "2026-08-26", "2026-08-26", "2026-08-27", "2026-08-27",
];
const PETUGAS = ["Yanti", "Reksa", "Agung"];

const warga = NAMA_WARGA.map((nama, i) => ({
  id: String(i + 1),
  nama,
  rt: `RT 0${(i % 3) + 1}`,
  ancalah: ancalahUntuk(i),
  aktif: true,
}));

// 29 KK pertama sudah lunas
const kupon = warga.map((w, i) => {
  const lunas = i < 29;
  return {
    id: String(i + 1),
    warga_id: w.id,
    kode: `MLD-${String(i + 1).padStart(4, "0")}`,
    nominal: w.ancalah,
    status: lunas ? "lunas" : "belum",
    tanggal_bayar: lunas ? TANGGAL_BAYAR[i % TANGGAL_BAYAR.length] : null,
    metode: lunas ? (i % 5 === 0 ? "transfer" : "tunai") : null,
    petugas: lunas ? PETUGAS[i % 3] : null,
  };
});

const transaksi = [];
kupon.filter((k) => k.status === "lunas").forEach((k) => {
  const w = warga.find((x) => x.id === k.warga_id);
  transaksi.push({
    id: `t${transaksi.length + 1}`,
    tanggal: k.tanggal_bayar,
    tipe: "masuk",
    jumlah: k.nominal,
    kategori: "Iuran Ancalah",
    keterangan: `Iuran Maulid Nabi · ${w.nama} (${w.rt}) · kupon ${k.kode}`,
    bukti_url: null,
    kupon_id: k.id,
  });
});
// infak di luar ancalah
transaksi.push(
  {
    id: `t${transaksi.length + 1}`,
    tanggal: "2026-08-25",
    tipe: "masuk",
    jumlah: 500000,
    kategori: "Infak Sukarela",
    keterangan: "Infak sukarela — H. Rahmat (di luar ancalah)",
    bukti_url: null,
    kupon_id: null,
  },
  {
    id: `t${transaksi.length + 1}`,
    tanggal: "2026-08-26",
    tipe: "masuk",
    jumlah: 300000,
    kategori: "Infak Sukarela",
    keterangan: "Infak pengurus DKM masjid (di luar ancalah)",
    bukti_url: null,
    kupon_id: null,
  }
);

// pengeluaran tercatat + bukti
const PENGELUARAN = [
  ["2026-08-21", 85000, "Konsumsi", "Konsumsi rapat persiapan panitia", "bukti-01.jpg"],
  ["2026-08-22", 150000, "Administrasi", "Cetak undangan & poster Maulid", "bukti-02.jpg"],
  ["2026-08-23", 400000, "Peralatan", "DP sewa tenda, kursi & panggung", "bukti-03.jpg"],
  ["2026-08-24", 275000, "Acara", "Belanja kitab, mukena & hadiah anak", "bukti-04.jpg"],
  ["2026-08-25", 120000, "Konsumsi", "Konsumsi pengajian persiapan Maulid", "bukti-05.jpg"],
  ["2026-08-26", 350000, "Dekorasi", "DP ornamen & dekorasi panggung", "bukti-06.jpg"],
];
PENGELUARAN.forEach(([tanggal, jumlah, kategori, keterangan, bukti]) => {
  transaksi.push({
    id: `t${transaksi.length + 1}`,
    tanggal,
    tipe: "keluar",
    jumlah,
    kategori,
    keterangan,
    bukti_url: bukti,
    kupon_id: null,
  });
});

let kotakSaran = [
  { id: "s1", nama: "Bapak Ujang", pesan: "Mungkin kegiatan ditambah lomba tahfiz anak-anak, biar makin semangat.", tampil: true, ditindaklanjuti: true, created_at: "2026-08-24" },
  { id: "s2", nama: null, pesan: "Terima kasih panitia, laporannya jelas dan mudah dilihat.", tampil: true, ditindaklanjuti: false, created_at: "2026-08-25" },
  { id: "s3", nama: "Ibu Euis", pesan: "Kalau bisa di hari H ada air minum gratis untuk warga yang datang.", tampil: true, ditindaklanjuti: true, created_at: "2026-08-26" },
  { id: "s4", nama: null, pesan: "Saran: pengeras suara diarahkan menjauh dari rumah warga yang sedang sakit.", tampil: false, ditindaklanjuti: false, created_at: "2026-08-27" },
];

// ------------------------- API -----------------------------------

export function getSettings() {
  return { ...pengaturan };
}

export function getStats() {
  const targetDana = warga.reduce((a, w) => a + w.ancalah, 0);
  const masuk = transaksi.filter((t) => t.tipe === "masuk").reduce((a, t) => a + t.jumlah, 0);
  const keluar = transaksi.filter((t) => t.tipe === "keluar").reduce((a, t) => a + t.jumlah, 0);
  const kkLunas = kupon.filter((k) => k.status === "lunas").length;
  return {
    target_dana: targetDana,
    dana_masuk: masuk,
    dana_keluar: keluar,
    sisa: masuk - keluar,
    persen: Math.round((masuk / targetDana) * 100),
    kk_total: warga.length,
    kk_lunas: kkLunas,
    transaksi_masuk: transaksi.filter((t) => t.tipe === "masuk").length,
    transaksi_keluar: transaksi.filter((t) => t.tipe === "keluar").length,
    diperbarui: new Date().toLocaleString("id-ID", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
    }),
  };
}

export function listWarga() {
  return warga.map((w) => {
    const k = kupon.find((x) => x.warga_id === w.id);
    return { ...w, kupon: k ? { ...k } : null };
  });
}

// pencarian publik — hanya field yang aman ditampilkan
export function cariWarga(q) {
  const norm = (q || "").trim().toLowerCase();
  if (norm.length < 2) return [];
  return warga
    .filter((w) => w.nama.toLowerCase().includes(norm))
    .slice(0, 8)
    .map((w) => {
      const k = kupon.find((x) => x.warga_id === w.id);
      return {
        id: w.id,
        nama: w.nama,
        rt: w.rt,
        nominal: w.ancalah,
        status: k ? k.status : "belum",
        tanggal_bayar: k?.tanggal_bayar ?? null,
        kode: k?.kode ?? null,
      };
    });
}

export function tandaiLunas(wargaId, { tanggal, metode = "tunai", petugas = "Bendahara" } = {}) {
  const k = kupon.find((x) => x.warga_id === String(wargaId));
  if (!k) return { ok: false, pesan: "Warga tidak ditemukan" };
  if (k.status === "lunas") return { ok: false, pesan: "Kupon sudah lunas" };
  const hari = tanggal || new Date().toISOString().slice(0, 10);
  k.status = "lunas";
  k.tanggal_bayar = hari;
  k.metode = metode;
  k.petugas = petugas;
  const w = warga.find((x) => x.id === k.warga_id);
  transaksi.push({
    id: `t${transaksi.length + 1}`,
    tanggal: hari,
    tipe: "masuk",
    jumlah: k.nominal,
    kategori: "Iuran Ancalah",
    keterangan: `Iuran Maulid Nabi · ${w.nama} (${w.rt}) · kupon ${k.kode}`,
    bukti_url: null,
    kupon_id: k.id,
  });
  return { ok: true };
}

export function listTransaksi({ tipe } = {}) {
  const rows = tipe ? transaksi.filter((t) => t.tipe === tipe) : [...transaksi];
  return [...rows].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}

export function tambahPengeluaran({ tanggal, jumlah, kategori, keterangan, buktiUrl }) {
  transaksi.push({
    id: `t${transaksi.length + 1}`,
    tanggal,
    tipe: "keluar",
    jumlah,
    kategori,
    keterangan,
    bukti_url: buktiUrl || null,
    kupon_id: null,
  });
  return { ok: true };
}

export function kirimSaran({ nama, pesan }) {
  kotakSaran.unshift({
    id: `s${kotakSaran.length + 1}`,
    nama: nama?.trim() || null,
    pesan: pesan.trim(),
    tampil: false,
    ditindaklanjuti: false,
    created_at: new Date().toISOString().slice(0, 10),
  });
  return { ok: true };
}

export function listSaran({ hanyaTampil = true } = {}) {
  const rows = hanyaTampil ? kotakSaran.filter((s) => s.tampil) : [...kotakSaran];
  return [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function setSaranStatus(id, { tampil, ditindaklanjuti } = {}) {
  const s = kotakSaran.find((x) => x.id === id);
  if (!s) return { ok: false };
  if (typeof tampil === "boolean") s.tampil = tampil;
  if (typeof ditindaklanjuti === "boolean") s.ditindaklanjuti = ditindaklanjuti;
  return { ok: true };
}
