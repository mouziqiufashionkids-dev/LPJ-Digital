<div align="center">

# 🕌 LPJ Digital — Maulid Nabi ﷺ

**Platform laporan pertanggungjawaban transparan untuk masjid & DKM —**
kupon iuran otomatis, kas live, notifikasi WhatsApp, sampai LPJ siap cetak.

Next.js · Supabase · Vercel · Fonnte (WhatsApp) · **Total biaya: Rp 0**

**[Coba 2 Menit](#-menjalankan-mode-demo--tanpa-setup) · [Pasang Sendiri](#-beralih-ke-data-sungguhan-supabase--gratis) · [Hasil Pemakaian Nyata](#-hasil-pemakaian-nyata)**

</div>

---

## 🌙 Cerita di Baliknya

Proyek ini lahir dari kebutuhan nyata: **warga minta transparansi, panitia kewalahan dengan Excel.**

> "Uang iuran saya sudah masuk belum?" — pertanyaan yang tiap hari harus
> dijawab bendahara dengan buka Excel satu per satu.

Untuk Maulid Nabi ﷺ 1448 H, DKM Masjid Al-Hikmah (Desa Margamulya) membangun
platform ini agar seluruh warga bisa melihat kas secara realtime. Saat LPJ
dibacakan di pengajian, semua angka sudah terbuka, berjalan sendiri, lengkap
dengan bukti nota — dan warga bisa cek sendiri kwitansi iurannya dari HP.

Sekarang kodenya dibagikan **gratis** supaya masjid, mushala, dan DKM lain
tidak perlu mulai dari nol. **Semoga menjadi amal jariyah.** 🤲

## 📊 Hasil Pemakaian Nyata

Ini bukan proyek laboratorium — web ini dipakai sungguhan untuk
[Maulid Nabi ﷺ 1448 H](https://dkm-alhikmah.vercel.app):

- **85 KK** didata dengan kelas ancalah (K1 Rp 150rb · K2 Rp 100rb · K3 Rp 75rb · Sponsor)
- **82 KK lunas (96%)** — kas masuk **Rp 10.870.000**, donasi barang **Rp 898.000** (non-kas)
- **121 transaksi** tercatat lengkap dengan foto nota
- Rekap otomatis ke grup WhatsApp panitia setiap malam
- LPJ diumumkan terbuka di pengajian — warga cek sendiri lewat HP masing-masing

Semua tangkapan layar di bawah adalah **data sungguhan** dari web tersebut
(tidak ada informasi rahasia — memang dibuat untuk terbuka).

## 📸 Tangkapan Layar

| Beranda & Progres Realtime | Kwitansi Digital (Cek Iuran) |
|---|---|
| ![Beranda](docs/img/beranda.png) | ![Cek Iuran](docs/img/cek-iuran.png) |

| Laporan Kas + Bukti Nota | Panel Panitia |
|---|---|
| ![Laporan](docs/img/laporan.png) | ![Admin](docs/img/admin.png) |

## ✨ Fitur

**Halaman publik (tanpa login):**
- 🏠 **Beranda** — progress dana live, rekap "X dari Y KK sudah lunas",
  jadwal sholat harian (API aladhan, metode Kemenag, highlight waktu
  berikutnya + tanggal hijriah), galeri dokumentasi dengan lightbox,
  social proof tamu & saran warga
- 🔎 **`/cek-iuran`** — ketik nama (mis. *Asep*) atau kode kupon (*MLD-0001*)
  → status + **kwitansi digital** (juga bisa lewat scan QR kupon)
- 📊 **`/laporan`** — rincian kas masuk/keluar, **klik gambar nota** untuk
  melihat bukti, donasi barang tampil terpisah (non-kas)
- 💌 **`/undangan`** — undangan digital + rundown + **konfirmasi kehadiran
  (RSVP)** — nama yang konfirmasi langsung tampil live sebagai calon tamu
- 📜 **`/proposal`** — proposal sponsor digital interaktif, bisa
  dipersonalisasi per sponsor (`/proposal?untuk=Nama`), CTA donasi sesuai
  minat (transfer/kas, sumbang barang, atau tanya panitia dulu)
- 💬 **`/kotak-saran`** — saran warga (masuk moderasi dulu), tampil sebagai
  kartu testimonial

**Panel panitia (dilindungi sandi):**
- 🔐 Akses: **klik logo masjid 3×** di halaman mana pun → login.
  Login tahan-banting: token di memori + localStorage + cookie + hash URL,
  sesi 8 jam. Sandi default mode demo: `alhikmah2026` (ganti via `ADMIN_PASSWORD`)
- 👥 **Tambah warga masal**: manual / tempel daftar / unggah Excel (.xlsx)
  atau CSV — kolom `Nama; RT; Alamat; Nominal; Kelas` dikenali otomatis,
  **anti-dobel** (nama sama tidak masuk dua kali)
- 🎟️ **`/admin/kupon`** — cetak kupon per kelas atau khusus sponsor
  (desain emas, dicetak terpisah), A4 10 kupon/lembar, **QR per kupon**.
  Tombol **🔧 Perbaiki kupon hilang** membuatkan kupon untuk warga yang
  belum punya (aman diklik kapan pun). Kirim kupon per warga via WhatsApp
- 💰 **Catat transaksi** (pemasukan/pengeluaran) + upload foto nota
  (maks 4 MB) — dengan **pencarian + filter + tampilkan semua**
  (edit & hapus permanen tidak dibatasi 8 terbaru)
- 📦 **Donasi barang otomatis terpisah dari kas uang** (kategori
  "Donasi Barang" = non-kas)
- 📱 **Notifikasi WhatsApp otomatis** ke grup panitia (via Fonnte, gratis):
  setiap pemasukan, pengeluaran, dan kupon lunas
- ⏰ **Rekap harian otomatis jam 20:00 WIB** (Vercel Cron) — berhenti
  sendiri setelah tanggal acara, plus **pesan penutup** (terima kasih +
  laporan akhir) yang bisa dikirim manual kapan saja
- 🧾 **Rekap per RT** untuk juru tagih + tombol kirim ke grup WA
- 🖨️ **`/laporan/cetak`** — LPJ siap cetak/PDF (desktop: tabel rapi,
  HP: kartu), ringkasan kas + daftar lengkap + bukti
- ⚙️ **`/admin/pengaturan`** — panitia mengedit sendiri TANPA koding:
  nama masjid/kegiatan, tanggal acara, nomor WA bendahara, rekening & QRIS
  donasi, kota jadwal sholat, teks berjalan, RAB anggaran, token Fonnte,
  plus **semua kalimat utama** tiap halaman dengan placeholder
  `{masjid}`/`{kegiatan}` otomatis
- 🧹 **Bersihkan data dobel** — deteksi nama sama, pertahankan yang lunas
- 🌙 **Mode gelap** + responsif penuh di HP

## 🚀 Menjalankan (mode demo — tanpa setup)

```bash
npm install
npm run dev
```

Buka http://localhost:3000 — aplikasi jalan dengan **data contoh**
(48 KK, transaksi, saran, RSVP). Tanpa database, tanpa akun, tanpa konfigurasi.

## 🛠️ Beralih ke data sungguhan (Supabase — gratis)

1. Buat project gratis di [supabase.com](https://supabase.com)
2. SQL Editor → jalankan seluruh isi [`supabase/schema.sql`](supabase/schema.sql)
   (tabel + keamanan RLS + bucket storage otomatis jadi)
3. Salin `.env.example` jadi `.env.local`, isi:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role — yang SECRET)
   - `ADMIN_PASSWORD` (sandi panitia — **WAJIB ganti!**)
4. Restart `npm run dev` — data kini tersimpan di database

**Deploy ke Vercel (gratis, ±30 menit):** push ke GitHub → vercel.com →
Import project → Environment Variables (isi 3 nilai di atas) → Deploy.
Nama project diganti jadi nama jelas (mis. `dkm-masjidku`) biar warga tidak
curiga penipuan. Panduan lengkap:
[`docs/DEPLOY.md`](docs/DEPLOY.md) · tanpa terminal sama sekali:
[`docs/PANDUAN-SETUP-WEBSITE.md`](docs/PANDUAN-SETUP-WEBSITE.md).

Setelah itu **semua pengaturan harian lewat UI** — tanpa terminal, tanpa koding.

## ❓ FAQ

**Kok gratis semua?** Free tier Vercel + Supabase cukup untuk kegiatan
kampung (±500 foto bukti). Fonnte gratis untuk pengiriman WA wajar.

**Bagaimana notifikasi WhatsApp bekerja?** Daftar Fonnte dengan nomor WA
bendahara → scan QR → masukkan bot ke grup panitia → isi token & Group ID
di menu Pengaturan Web. Setiap transaksi & kupon lunas otomatis terkirim.

**Rekap harian berhenti kapan?** Otomatis berhenti setelah tanggal acara
(diambil dari Pengaturan Web). Bisa juga kirim manual pesan penutup
(terima kasih + laporan akhir) dari panel panitia.

**Bisa untuk acara selain Maulid?** Bisa — nama kegiatan, tanggal, dan
seluruh teks bisa diganti dari pengaturan (qurban, haul, santunan, dll).

**Data warga aman?** Halaman publik hanya menampilkan nama + status iuran
(yang memang tujuannya: transparansi LPJ). Panel panitia dilindungi sandi,
semua API panitia lewat middleware server-side. Jangan commit `.env`.

## 📈 Status pengembangan

- [x] Konsep v2 ([`docs/KONSEP.md`](docs/KONSEP.md)) + riset web masjid
      referensi ([`docs/REFERENSI.md`](docs/REFERENSI.md))
- [x] Branding masjid + logo SVG digambar presisi (bukan AI — tajam di semua ukuran)
- [x] Halaman publik: beranda live, cek iuran + kwitansi, laporan dengan nota,
      kotak saran, undangan + RSVP, proposal sponsor
- [x] Panel panitia tersembunyi & dilindungi sandi (klik logo 3× → login)
- [x] Tambah warga masal (manual/tempel/Excel/CSV) → kupon otomatis
- [x] Cetak kupon massal A4 + QR per kupon, per kelas & sponsor terpisah
- [x] Catat transaksi + upload foto nota + edit/hapus permanen
- [x] Jadwal sholat harian + galeri dokumentasi
- [x] **Notifikasi WhatsApp otomatis + rekap harian cron + pesan penutup**
- [x] **LPJ siap cetak/PDF** (`/laporan/cetak`)
- [x] Edit warga & pengaturan lewat UI (sinkron kupon + transaksi)
- [x] Donasi barang terpisah dari kas uang
- [x] Mode gelap + responsif penuh di HP
- [x] **Deploy produksi & dipakai sungguhan** —
      [dkm-alhikmah.vercel.app](https://dkm-alhikmah.vercel.app) 🎉
- [ ] Ekspor Excel untuk rapat panitia
- [ ] Tema warna alternatif (biru-putih, dll)

## 🤝 Berbagi & Kontribusi

- Mau sebar ke masjid lain? Template pesannya siap pakai:
  [`docs/BAGIKAN.md`](docs/BAGIKAN.md)
- Mau bantu kembangkan? Baca [CONTRIBUTING.md](CONTRIBUTING.md)
- Menemukan masalah? Buka issue di GitHub

## 📁 Struktur Singkat

```
src/app/            halaman publik + panel panitia + API routes
src/lib/            store (Supabase/demo), notifikasi WA, konten editable
src/components/     komponen UI (ticker, marquee, kupon, dll)
supabase/schema.sql skema database (jalankan sekali di SQL Editor)
docs/               panduan deploy, setup tanpa terminal, kit berbagi
```

## 📜 Lisensi

[MIT](LICENSE) — pakai gratis, ubah gratis, sebar gratis.
Kami hanya mohon doanya: **semoga bermanfaat untuk umat.** 🌙

---

<div align="center">

**Barakallahu fiikum** — dibuat dengan ♥ oleh Panitia Maulid Nabi ﷺ 1448 H,
DKM Masjid Al-Hikmah, Desa Margamulya

</div>
