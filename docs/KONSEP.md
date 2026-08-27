# LPJ Digital — Kegiatan Maulid Nabi ﷺ

Dokumen konsep v2.0 — hasil diskusi, disesuaikan dari pembelajaran proyek
sebelumnya (SIMSALABIM · LPJ HUT RI ke-81 RW 3 Cibaur, Garut).

> *"Dari warga, untuk warga — dicatat terbuka, dilaporkan amanah."*

---

## 1. Ringkasan Konsep

Website **LPJ + monitoring iuran realtime** untuk kegiatan Maulid Nabi ﷺ.
Berbeda dari SIMSALABIM yang merupakan LPJ akhir (setelah acara selesai),
program ini dipakai **sejak masa iuran hingga laporan akhir**:

1. 🎟️ **Kupon/Ancalah iuran otomatis** — daftar warga + nominal → kupon
   tercetak & kode unik dibuat otomatis
2. 📈 **Live laporan dana masuk** — realtime, dibandingkan target panitia
3. 💸 **Live laporan kas keluar** — realtime + bukti, seperti sebelumnya
4. 📮 **Kotak saran** — warga bisa menyampaikan masukan

## 2. Analisis SIMSALABIM (web sebelumnya)

### Yang sudah bagus — dipertahankan
- ✅ Badge "Laporan terverifikasi panitia" + identitas pengelola
- ✅ Pecahan transaksi kecil tercatat semua (Rp 5.000 pun masuk)
- ✅ Bukti foto di tiap pengeluaran
- ✅ Daftar donatur + RT-nya → familiar bagi warga
- ✅ Galeri dokumentasi kegiatan
- ✅ Susunan panitia dengan foto → "dikelola orang yang Anda kenal"

### Yang kurang — dikembangkan di versi Maulid
| # | Kekurangan | Solusi di versi baru |
|---|---|---|
| 1 | LPJ baru muncul **setelah acara selesai** — warga buta saat masa iuran | Monitoring **realtime** dari hari pertama iuran |
| 2 | **Tidak ada target dana** — tidak ada patokan "udah sampai mana" | Target + progress bar besar "Rp X dari Rp Y (Z%)" |
| 3 | Donatur tampil sebagai daftar datar — **tidak ada status iuran per KK** | Sistem kupon/ancalah: track siapa sudah/belum bayar |
| 4 | **Tidak ada kwitansi/struk** atas pembayaran warga | Kwitansi digital (bisa di-screenshot/dikirim WA) |
| 5 | Warga **tidak bisa mengecek sendiri** iurannya | Fitur "Cek Iuran Saya" — cari nama → lihat status |
| 6 | Tidak ada saluran masukan | Kotak saran |
| 7 | Nama domain `simsalabim-five.vercel.app` terkesan aneh → dicurigai penipuan | Lihat Bagian 6 (Kepercayaan & Domain) |
| 8 | Tampilan kurang ramah bagi masyarakat awam | Lihat Bagian 5 (Desain) |

## 3. Fitur Utama (MVP)

### A. Sistem Kupon / Ancalah Iuran
- Admin input daftar KK/warga + nominal ancalah (bisa seragam atau
  bertingkat) → sistem **membuat kupon otomatis** lengkap dengan kode unik
- **Cetak massal** kupon lembar A4 (siap potong) untuk dibagikan juru tagih
- Saat warga bayar: petugas tandai "lunas" (cari nama / input kode kupon)
  → tercatat tanggal, petugas, metode (tunai/transfer)
- **Kwitansi digital** otomatis — kartu berisi nama, nominal, tanggal,
  kode — bisa di-screenshot atau dikirim via WhatsApp sebagai bukti sah
- Rekap juru tagih: sisa KK yang belum bayar (untuk mempercepat penagihan)

### B. Live Dana Masuk vs Target
- Progress bar besar + angka jelas: "Sudah terkumpul **Rp X** dari target **Rp Y**"
- Rekap per RT (jika iuran lintas RT)
- Grafik harian pemasukan (opsional, sekunder — angka besar lebih penting)
- Update **realtime** (Supabase Realtime) — tidak perlu refresh

### C. Live Kas Keluar
- Sama seperti SIMSALABIM: catatan pengeluaran + bukti foto + keterangan
- Tambah: **kategori** (konsumsi, dekorasi, hadiah, operasional, dll.)
- Sisa dana selalu tampak: masuk − keluar

### D. Kotak Saran
- Formulir: nama (opsional/anonim) + pesan
- Warga bisa melihat saran yang sudah disetujui panitia (moderasi dulu,
  cegah spam/ucapan tidak pantas)
- Admin bisa menandai saran "ditindaklanjuti ✅"

## 4. Saran Fitur Tambahan (menuju paripurna)

| Prioritas | Fitur | Kenapa penting |
|---|---|---|
| Tinggi | **Cek Iuran Saya** (kolom cari nama) | Warga cek sendiri tanpa tanya bendahara |
| Tinggi | Tombol **"Bagikan ke WhatsApp"** ringkasan laporan | Sebar transparansi ke grup RT/RW |
| Sedang | **Countdown** hari-H Maulid + rundown acara | Antisipasi + informasi |
| Sedang | Ekspor laporan **PDF/Excel** untuk rapat panitia | LPJ formal |
| Sedang | **QRIS statis** (gambar milik bendahara) + konfirmasi via WA | Transfer tanpa payment gateway |
| Rendah | Notifikasi WA otomatis saat kupon lunas | Butuh layanan berbayar; sisakan dulu |

## 5. Desain untuk Masyarakat Awam

Prinsip: **"Buka web, langsung paham."**

- 📱 **Mobile-first** — mayoritas warga buka dari HP
- 🔢 **Angka besar & kalimat sederhana**: "Sudah terkumpul Rp 5.200.000
  dari Rp 8.000.000" — hindari istilah teknis (kalau perlu tutur Sunda
  ringan: *"Iuran anjeun geus beres!"*)
- 🧭 Menu dikit & jelas: **Beranda · Cek Iuran · Laporan · Kotak Saran**
- ⏳ Progress bar gaya "termometer" — paham tanpa baca angka
- 🔤 Font besar, kontras tinggi, banyak ruang kosong
- 🎨 Ikon + warna konsisten (hijau = masuk, merah lembut = keluar)

## 6. Kepercayaan & Domain (jawaban catatan #1)

Masalah: `simsalabim-five.vercel.app` terkesan aneh → dicurigai penipuan.

**Solusi berlapis:**
1. **Domain sendiri (terbaik)** — beli `.my.id` / `.web.id`
   (± Rp 15–30 rb/tahun, di Niagahoster/Hostinger/Cloudflare), misal:
   `maulid-cibaur.my.id` — terasa resmi, mudah diucapkan, bisa disebar
   lisan. Vercel free tier mendukung custom domain non-komersial.
2. **Nama project Vercel yang wajar** (kalau tidak beli domain):
   `maulid-rw3.vercel.app` jauh lebih meyakinkan daripada `simsalabim-five`
3. **Sebar link dari sosok tepercaya**: ketua RT/RW yang kirim ke grup WA
   resmi, bukan link dari orang tak dikenal
4. **Halaman "Tentang & Verifikasi"**: foto + nama panitia, kontak
   bendahara (tombol chat WA langsung), alamat balai/masjid
5. **QR code** di undangan/poster/struk kupon yang mengarah ke web
6. Badge "Laporan terverifikasi panitia" (pertahankan dari sebelumnya)

## 7. Tema Visual Islami / Maulid Nabi

- **Warna utama**: hijau zamrud tua `#0B6E4F` + aksen emas `#D4AF37` +
  latar krem hangat `#FAF7EF` — tenang, khidmat, terang (ramah lansia)
- **Ornamen**: pola arabesque/geometri islami halus (SVG, ringan),
  bulan sabit, siluet masjid/gunungan, motif kaligrafi
- **Tipografi**: judul serif elegan (mis. *Amiri* / *Playfair Display*),
  teks isi sans-serif jelas (*Inter* / *Poppins*), angka pakai tabular
- **Sentuhan**: pembuka "﷽" / salam "Assalamu'alaikum", doa singkat,
  tanggal hijriah pada header
- **Kupon**: nuansa sama — bingkai ornamen, tulisan "Kupon Iuran Maulid
  Nabi", nama + RT, nominal, kode unik, QR kecil, area tanda tangan
  bendahara. *(Desain detailnya nanti diulik bersama.)*

## 8. Model Data (inti)

```
pengaturan     : nama_kegiatan, target_dana, tanggal_acara,
                 alamat, kontak_wa, tanggal_hijriah
warga          : nama, rt, blok/no rumah, nominal_ancalah, aktif
kupon          : kode_unik, warga_id, nominal, status(lunas/belum),
                 tanggal_bayar, petugas, metode, keterangan
transaksi      : tanggal, tipe(masuk/keluar), jumlah, kategori,
                 keterangan, bukti_url, kupon_id?, dicatat_oleh
kotak_saran    : nama?, pesan, created_at, status(moderasi), ditindaklanjuti
panitia        : nama, jabatan, foto_url
agenda         : waktu, judul, lokasi, keterangan
dokumentasi    : judul, foto_url
```

## 9. Struktur Halaman

```
/                  → Beranda: salam, progress target, ringkasan kas,
                     countdown, panitia, kontak bendahara
/cek-iuran         → Cek Iuran Saya (cari nama → status + kwitansi)
/laporan           → Rincian masuk & keluar + bukti + filter
/kotak-saran       → Form + daftar saran yang disetujui
/admin/login
/admin             → Dashboard ringkas
/admin/warga-kupon → Kelola warga, generate & cetak kupon, tandai lunas
/admin/transaksi   → Catat pemasukan/pengeluaran + upload bukti
/admin/kotak-saran → Moderasi saran
/admin/pengaturan  → Target, nama kegiatan, kontak, panitia, agenda
```

## 10. Tech Stack (kelanjutan yang sudah terbukti)

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js (App Router) | Sama seperti sebelumnya |
| Database & Auth | Supabase | + **Realtime** untuk update live |
| Storage | Supabase Storage | Foto bukti & dokumentasi |
| Styling | Tailwind CSS | Tema islami custom |
| Hosting | Vercel (free) | + custom domain `.my.id` |
| Grafik | Recharts | Sederhana & cantik |
| Cetak kupon | Halaman print-friendly CSS | Generate → Cetak A4 |

## 11. Roadmap

1. **Minggu 1**: setup, skema database, admin panel (warga + kupon +
   transaksi), generate & cetak kupon
2. **Minggu 2**: halaman publik (beranda + live progress + laporan +
   cek iuran + kotak saran), kwitansi digital, polish tema islami
3. **Setelah Maulid**: LPJ akhir + ekspor PDF, evaluasi

## 12. Keputusan (hasil diskusi 27 Agu 2026)

1. ✅ **Ancalah per KK, nominal bertingkat** — beda-beda sesuai musyawarah
2. ✅ **Banner publik**: rekap "X dari Y KK sudah lunas" (anonim).
   **Menu "Cek Iuran"**: pencarian nama → status diterima/belum
3. ✅ **Domain**: rename project Vercel ke nama yang jelas (custom domain menyusul)
4. ✅ Komunitas berbeda dari SIMSALABIM — **nama & tanggal kegiatan menyusul**
5. ✅ Repo: lanjut di **LPJ-Digital**
6. ⏳ Desain kupon: akan diulik bersama setelah kerangka jadi
7. ⏳ Login admin & proteksi: tahap berikutnya
