// ===================================================================
// PENYIMPANAN DEMO — data contoh di memori, tanpa database.
// Cocok untuk mencoba alur & tampilan. Data akan ter-reset saat
// server dinyalakan ulang.
//
// State disimpan di globalThis supaya DIKALI SATU untuk seluruh
// route/bundle (mode dev Next.js mengompilasi tiap route terpisah).
//
// Untuk data sungguhan: isi .env (lihat .env.example) dan jalankan
// supabase/schema.sql — aplikasi otomatis beralih ke Supabase.
// ===================================================================

const HARI_DEMO = [
  "2026-08-20", "2026-08-21", "2026-08-21", "2026-08-22", "2026-08-22",
  "2026-08-23", "2026-08-23", "2026-08-24", "2026-08-24", "2026-08-25",
  "2026-08-25", "2026-08-26", "2026-08-26", "2026-08-27", "2026-08-27",
];
const PETUGAS = ["Yanti", "Reksa", "Agung"];

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

function buatDataDemo() {
  const pengaturan = {
    nama_masjid: "Masjid Jami' Al-Hikmah", // <- ganti dengan nama masjid Anda
    nama_kegiatan: "Maulid Nabi ﷺ 1447 H",
    hijriah: "12 Rabiul Awal 1447 H",
    penyelenggara: "[Nama RT/RW · Kampung] — ganti di Pengaturan Admin",
    penyelenggara_singkat: "RT/RW · Kampung Anda",
    lokasi_acara: "Balai Warga & Masjid Jami' Al-Hikmah",
    tanggal_acara: "2026-09-04T08:00:00+07:00", // konfirmasi tanggal panitia
    kontak_wa: "628123456789", // nomor bendahara (format 62…)
  };

  const warga = NAMA_WARGA.map((nama, i) => ({
    id: String(i + 1),
    nama,
    rt: `RT 0${(i % 3) + 1}`,
    alamat: `Blok ${String.fromCharCode(65 + (i % 8))} No. ${i + 1}`,
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
      tanggal_bayar: lunas ? HARI_DEMO[i % HARI_DEMO.length] : null,
      metode: lunas ? (i % 5 === 0 ? "transfer" : "tunai") : null,
      petugas: lunas ? PETUGAS[i % 3] : null,
    };
  });

  const transaksi = [];
  kupon
    .filter((k) => k.status === "lunas")
    .forEach((k) => {
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

  // pengeluaran tercatat + bukti nota (foto nota asli di produksi)
  const PENGELUARAN = [
    ["2026-08-21", 85000, "Konsumsi", "Konsumsi rapat persiapan panitia", "/bukti/nota-01.svg"],
    ["2026-08-22", 150000, "Administrasi", "Cetak undangan & poster Maulid", "/bukti/nota-02.svg"],
    ["2026-08-23", 400000, "Peralatan", "DP sewa tenda, kursi & panggung", "/bukti/nota-03.svg"],
    ["2026-08-24", 275000, "Acara", "Belanja kitab, mukena & hadiah anak", "/bukti/nota-04.svg"],
    ["2026-08-25", 120000, "Konsumsi", "Konsumsi pengajian persiapan Maulid", "/bukti/nota-05.svg"],
    ["2026-08-26", 350000, "Dekorasi", "DP ornamen & dekorasi panggung", "/bukti/nota-06.svg"],
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

  const kotakSaran = [
    { id: "s1", nama: "Bapak Ujang", pesan: "Mungkin kegiatan ditambah lomba tahfiz anak-anak, biar makin semangat.", tampil: true, ditindaklanjuti: true, created_at: "2026-08-24" },
    { id: "s2", nama: null, pesan: "Terima kasih panitia, laporannya jelas dan mudah dilihat.", tampil: true, ditindaklanjuti: false, created_at: "2026-08-25" },
    { id: "s3", nama: "Ibu Euis", pesan: "Kalau bisa di hari H ada air minum gratis untuk warga yang datang.", tampil: true, ditindaklanjuti: true, created_at: "2026-08-26" },
    { id: "s4", nama: null, pesan: "Saran: pengeras suara diarahkan menjauh dari rumah warga yang sedang sakit.", tampil: false, ditindaklanjuti: false, created_at: "2026-08-27" },
  ];

  // rundown acara (ditampilkan di halaman undangan)
  const agenda = [
    { id: 1, waktu: "08.00 WIB", judul: "Pembukaan & tilawah", lokasi: "Masjid", keterangan: "Dibuka oleh panitia" },
    { id: 2, waktu: "08.15 WIB", judul: "Marhaban & Maulid Ad-Diba'i", lokasi: "Masjid", keterangan: "Dipimpin majelis taklim" },
    { id: 3, waktu: "09.00 WIB", judul: "Taushiyah / ceramah agama", lokasi: "Masjid", keterangan: "Penceramah menyusul (mengikuti)" },
    { id: 4, waktu: "10.00 WIB", judul: "Doa bersama & santunan", lokasi: "Masjid", keterangan: "Santunan anak yatim & dhuafa" },
    { id: 5, waktu: "10.45 WIB", judul: "Makan bersama jamaah", lokasi: "Halaman masjid", keterangan: "" },
  ];

  // konfirmasi kehadiran (RSVP) undangan
  const rsvp = [
    { id: "r1", nama: "H. Rahmatullah", rt: "RT 01", kehadiran: "hadir", jumlah_tamu: 4, catatan: "", created_at: "2026-08-25" },
    { id: "r2", nama: "Ibu Samiun", rt: "RT 02", kehadiran: "hadir", jumlah_tamu: 2, catatan: "", created_at: "2026-08-25" },
    { id: "r3", nama: "Kang Beben", rt: "RT 03", kehadiran: "hadir", jumlah_tamu: 5, catatan: "ikut membawa anak-anak pengajian", created_at: "2026-08-26" },
    { id: "r4", nama: "Aan Supriatna", rt: "RT 02", kehadiran: "hadir", jumlah_tamu: 3, catatan: "", created_at: "2026-08-26" },
    { id: "r5", nama: "Euis Komariah", rt: "RT 01", kehadiran: "belum_pasti", jumlah_tamu: 2, catatan: "menunggu kabar keluarga", created_at: "2026-08-26" },
    { id: "r6", nama: "Warga (merantau)", rt: null, kehadiran: "berhalangan", jumlah_tamu: 0, catatan: "sedang di perantauan", created_at: "2026-08-27" },
  ];

  return {
    pengaturan,
    warga,
    kupon,
    transaksi,
    kotakSaran,
    agenda,
    rsvp,
    idWargaBerikut: warga.length + 1,
    idKuponBerikut: kupon.length + 1,
    kodeAngkaBerikut: kupon.length + 1,
  };
}

// SATU instance untuk seluruh route (lihat penjelasan di atas)
const S = (globalThis.__lpjDataDemo ??= buatDataDemo());
// Saat kode diperbarui di dev (hot-reload), state lama mungkin belum punya
// kunci baru — tambahkan otomatis agar tidak error:
if (!Array.isArray(S.rsvp) || !Array.isArray(S.agenda)) {
  const baru = buatDataDemo();
  if (!Array.isArray(S.rsvp)) S.rsvp = baru.rsvp;
  if (!Array.isArray(S.agenda)) S.agenda = baru.agenda;
}

// ------------------------- API -----------------------------------

function tampilanWarga(w) {
  const k = S.kupon.find((x) => x.warga_id === w.id);
  return {
    id: w.id,
    nama: w.nama,
    rt: w.rt,
    nominal: w.ancalah,
    status: k ? k.status : "belum",
    tanggal_bayar: k?.tanggal_bayar ?? null,
    kode: k?.kode ?? null,
  };
}

export function getSettings() {
  return { ...S.pengaturan };
}

export function getStats() {
  const targetDana = S.warga.reduce((a, w) => a + w.ancalah, 0);
  const masuk = S.transaksi.filter((t) => t.tipe === "masuk").reduce((a, t) => a + t.jumlah, 0);
  const keluar = S.transaksi.filter((t) => t.tipe === "keluar").reduce((a, t) => a + t.jumlah, 0);
  const kkLunas = S.kupon.filter((k) => k.status === "lunas").length;
  return {
    target_dana: targetDana,
    dana_masuk: masuk,
    dana_keluar: keluar,
    sisa: masuk - keluar,
    persen: Math.round((masuk / targetDana) * 100),
    kk_total: S.warga.length,
    kk_lunas: kkLunas,
    transaksi_masuk: S.transaksi.filter((t) => t.tipe === "masuk").length,
    transaksi_keluar: S.transaksi.filter((t) => t.tipe === "keluar").length,
    diperbarui: new Date().toLocaleString("id-ID", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
    }),
  };
}

export function listWarga() {
  return S.warga.map((w) => {
    const k = S.kupon.find((x) => x.warga_id === w.id);
    return { ...w, kupon: k ? { ...k } : null };
  });
}

// pencarian publik — cukup nama ATAU kode kupon (dari QR kupon cetak)
export function cariWarga(q) {
  const norm = (q || "").trim().toLowerCase();
  if (!norm) return [];
  if (/^mld-?\d{1,6}$/i.test(norm)) {
    const kode = `MLD-${String(norm.replace(/^mld-?/i, "")).padStart(4, "0")}`;
    const k = S.kupon.find((x) => x.kode === kode);
    if (k) {
      const w = S.warga.find((x) => x.id === k.warga_id);
      if (w) return [tampilanWarga(w)];
    }
    return [];
  }
  if (norm.length < 2) return [];
  return S.warga
    .filter((w) => w.nama.toLowerCase().includes(norm))
    .slice(0, 8)
    .map(tampilanWarga);
}

export function tandaiLunas(wargaId, { tanggal, metode = "tunai", petugas = "Bendahara" } = {}) {
  const k = S.kupon.find((x) => x.warga_id === String(wargaId));
  if (!k) return { ok: false, pesan: "Warga tidak ditemukan" };
  if (k.status === "lunas") return { ok: false, pesan: "Kupon sudah lunas" };
  const hari = tanggal || new Date().toISOString().slice(0, 10);
  k.status = "lunas";
  k.tanggal_bayar = hari;
  k.metode = metode;
  k.petugas = petugas;
  const w = S.warga.find((x) => x.id === k.warga_id);
  S.transaksi.push({
    id: `t${S.transaksi.length + 1}`,
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

// tambah warga massal: tiap warga otomatis dapat kupon berkode unik
export function tambahWargaBatch(rows) {
  const valid = (rows || []).filter((r) => r && String(r.nama || "").trim());
  if (!valid.length) return { ok: false, pesan: "Tidak ada baris valid" };
  const dibuat = [];
  for (const r of valid) {
    const w = {
      id: String(S.idWargaBerikut++),
      nama: String(r.nama).trim().slice(0, 80),
      rt: String(r.rt || "").trim().slice(0, 20),
      alamat: String(r.alamat || "").trim().slice(0, 120),
      ancalah: Number(r.ancalah) || 0,
      aktif: true,
    };
    S.warga.push(w);
    const k = {
      id: String(S.idKuponBerikut++),
      warga_id: w.id,
      kode: `MLD-${String(S.kodeAngkaBerikut++).padStart(4, "0")}`,
      nominal: w.ancalah,
      status: "belum",
      tanggal_bayar: null,
      metode: null,
      petugas: null,
    };
    S.kupon.push(k);
    dibuat.push({ nama: w.nama, kode: k.kode, ancalah: w.ancalah });
  }
  return { ok: true, ditambah: dibuat.length, kupon: dibuat };
}

export function hapusWarga(id) {
  const i = S.warga.findIndex((w) => w.id === String(id));
  if (i === -1) return { ok: false, pesan: "Warga tidak ditemukan" };
  const [w] = S.warga.splice(i, 1);
  const ki = S.kupon.findIndex((k) => k.warga_id === w.id);
  const kuponId = ki !== -1 ? S.kupon[ki].id : null;
  if (ki !== -1) S.kupon.splice(ki, 1);
  for (let j = S.transaksi.length - 1; j >= 0; j--) {
    if (S.transaksi[j].kupon_id === kuponId) S.transaksi.splice(j, 1);
  }
  return { ok: true };
}

export function listTransaksi({ tipe } = {}) {
  const rows = tipe ? S.transaksi.filter((t) => t.tipe === tipe) : [...S.transaksi];
  return [...rows].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}

export function tambahPengeluaran({ tanggal, jumlah, kategori, keterangan, buktiUrl }) {
  S.transaksi.push({
    id: `t${S.transaksi.length + 1}`,
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
  S.kotakSaran.unshift({
    id: `s${S.kotakSaran.length + 1}-${Date.now()}`,
    nama: nama?.trim() || null,
    pesan: pesan.trim(),
    tampil: false,
    ditindaklanjuti: false,
    created_at: new Date().toISOString().slice(0, 10),
  });
  return { ok: true };
}

export function listSaran({ hanyaTampil = true } = {}) {
  const rows = hanyaTampil ? S.kotakSaran.filter((s) => s.tampil) : [...S.kotakSaran];
  return [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function setSaranStatus(id, { tampil, ditindaklanjuti } = {}) {
  const s = S.kotakSaran.find((x) => x.id === id);
  if (!s) return { ok: false };
  if (typeof tampil === "boolean") s.tampil = tampil;
  if (typeof ditindaklanjuti === "boolean") s.ditindaklanjuti = ditindaklanjuti;
  return { ok: true };
}

// --------------------- AGENDA & RSVP UNDANGAN ---------------------

export function listAgenda() {
  return S.agenda.map((a) => ({ ...a }));
}

export function kirimRsvp({ nama, rt, kehadiran, jumlah_tamu, catatan }) {
  S.rsvp.unshift({
    id: `r${Date.now()}`,
    nama: String(nama).trim().slice(0, 80),
    rt: rt?.trim() ? rt.trim().slice(0, 20) : null,
    kehadiran,
    jumlah_tamu: kehadiran === "berhalangan" ? 0 : Math.max(1, Math.min(15, Number(jumlah_tamu) || 1)),
    catatan: catatan?.trim() ? catatan.trim().slice(0, 200) : null,
    created_at: new Date().toISOString().slice(0, 10),
  });
  return { ok: true };
}

export function listRsvp() {
  return [...S.rsvp].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getRsvpStats() {
  const hadir = S.rsvp.filter((r) => r.kehadiran === "hadir");
  const belum = S.rsvp.filter((r) => r.kehadiran === "belum_pasti");
  const halang = S.rsvp.filter((r) => r.kehadiran === "berhalangan");
  return {
    hadir_nama: hadir.length,
    hadir_tamu: hadir.reduce((a, r) => a + r.jumlah_tamu, 0),
    belum_pasti_nama: belum.length,
    belum_pasti_tamu: belum.reduce((a, r) => a + r.jumlah_tamu, 0),
    berhalangan_nama: halang.length,
  };
}

export function hapusRsvp(id) {
  const i = S.rsvp.findIndex((r) => r.id === id);
  if (i === -1) return { ok: false, pesan: "Data tidak ditemukan" };
  S.rsvp.splice(i, 1);
  return { ok: true };
}
