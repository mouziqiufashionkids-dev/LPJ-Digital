// ============================================================
// KAMUS TEKS HALAMAN — semua kalimat ini bisa diedit panitia
// lewat Panel Panitia → Pengaturan. Nilai di bawah adalah nilai
// bawaan (dipakai kalau belum pernah diubah).
//
// Placeholder yang bisa dipakai di dalam teks:
//   {masjid}    -> nama masjid (pengaturan)
//   {kegiatan}  -> nama kegiatan (pengaturan)
//   {sapaan}    -> sapaan personal (khusus proposal)
// ============================================================

export const KONTEN_DEFAULT = {
  "beranda.pembuka": {
    halaman: "Beranda",
    label: "Kalimat pembuka (di bawah judul besar)",
    jenis: "panjang",
    nilai:
      "Assalamu'alaikum warahmatullahi wabarakatuh. Laporan iuran dan kas kegiatan {kegiatan} — setiap rupiah tercatat terbuka dan bisa dicek warga kapan saja.",
  },
  "beranda.verifikasi": {
    halaman: "Beranda",
    label: "Poin 'ini web resmi, bukan penipuan' (satu poin per baris)",
    jenis: "baris",
    nilai:
      "Web resmi dikelola panitia {masjid} — tautan disebar langsung pengurus di grup WhatsApp resmi RT/RW.\nDikelola oleh panitia — orang-orang yang Anda kenal.\nMasih ragu? Hubungi bendahara lewat tombol WhatsApp di bagian bawah halaman ini.",
  },
  "undangan.teks": {
    halaman: "Undangan",
    label: "Isi undangan (kalimat resmi undangan)",
    jenis: "panjang",
    nilai:
      "Dengan memohon rahmat dan ridha Allah ﷻ, {masjid} mengundang seluruh warga lingkungan untuk hadir dan menghadiri rangkaian peringatan {kegiatan}. Kehadiran Anda adalah doa dan dukungan terbaik untuk kebersamaan kita.",
  },
  "cekiuran.deskripsi": {
    halaman: "Cek Iuran",
    label: "Kalimat penjelas halaman cek iuran",
    jenis: "panjang",
    nilai:
      "Sudah bayar iuran? Pastikan sudah diterima dan tercatat panitia. Cukup ketik nama — tanpa login, tanpa data pribadi.",
  },
  "kotaksaran.deskripsi": {
    halaman: "Kotak Saran",
    label: "Kalimat penjelas kotak saran",
    jenis: "panjang",
    nilai:
      "Sampaikan saran, masukan, atau doa untuk kegiatan. Boleh anonim. Panitia membaca semuanya.",
  },
  "proposal.salam": {
    halaman: "Proposal Sponsor",
    label: "Paragraf salam & latar belakang",
    jenis: "panjang",
    nilai:
      "Assalamu'alaikum warahmatullahi wabarakatuh, {sapaan}Puji syukur ke hadirat Allah ﷻ, dan shalawat bagi Nabi Muhammad ﷺ. Dalam rangka memperingati hari kelahiran Rasulullah ﷺ, {masjid} bersama warga akan menyelenggarakan peringatan {kegiatan} — kegiatan yang insya Allah menjadi sarana silaturahmi, syiar, dan pendidikan akhlak bagi anak-anak dan warga sekitar.",
  },
  "proposal.ajakan": {
    halaman: "Proposal Sponsor",
    label: "Paragraf ajakan berdonasi",
    jenis: "panjang",
    nilai:
      "Kegiatan ini sepenuhnya digotong bersama warga melalui iuran ancalah. Namun agar kegiatan berjalan lebih baik — konsumsi jamaah, hadiah anak-anak, santunan, dan perlengkapan acara — kami mengharapkan dukungan para dermawan seperti Anda. Sedikit atau banyak, insya Allah berlipat pahalanya.",
  },
  "proposal.kebutuhan": {
    halaman: "Proposal Sponsor",
    label: "Titik yang membutuhkan dukungan (satu per baris)",
    jenis: "baris",
    nilai:
      "🍚 Konsumsi jamaah & panitia (makan bersama ratusan warga)\n🎁 Hadiah perlombaan & pengajian anak-anak\n🤲 Santunan anak yatim & warga dhuafa\n🎪 Dekorasi, tenda, & perlengkapan panggung\n📖 Kitab, mukena, & keperluan majelis",
  },
  "proposal.keistimewaan": {
    halaman: "Proposal Sponsor",
    label: "Paragraf keistimewaan mendukung Maulid",
    jenis: "panjang",
    nilai:
      "Rasulullah ﷺ bersabda: \"Barangsiapa menghidupkan sunnahku yang telah mati di tengah umatku, maka baginya pahala seperti pahala seratus orang mati syahid.\" Dukungan Anda ikut menghidupkan syiar Islam di kampung kami — dan nama Anda akan disebut dalam doa jamaah serta dicatat dalam laporan terbuka panitia.",
  },
  "footer.tagline": {
    halaman: "Footer (kaki semua halaman)",
    label: "Kalimat 'dikelola oleh siapa'",
    jenis: "pendek",
    nilai: "Dikelola oleh panitia — orang-orang yang Anda kenal.",
  },
  "footer.transparansi": {
    halaman: "Footer (kaki semua halaman)",
    label: "Kalimat transparansi",
    jenis: "pendek",
    nilai: "Setiap rupiah dicatat terbuka dan bisa dicek warga kapan saja.",
  },
};

// ganti placeholder {masjid} / {kegiatan} / {sapaan} dengan nilai asli
export function isi(teks, pengaturan = {}, ekstra = {}) {
  return String(teks ?? "")
    .split("{masjid}").join(pengaturan.nama_masjid || "")
    .split("{kegiatan}").join(pengaturan.nama_kegiatan || "")
    .split("{sapaan}").join(ekstra.sapaan || "");
}
