# LPJ Digital — Maulid Nabi ﷺ

Laporan pertanggungjawaban digital kegiatan Maulid Nabi di bawah **nama
masjid** (bisa dipakai ulang untuk kegiatan lain): kupon iuran (ancalah)
otomatis + cetak massal, progress dana live, kas keluar dengan nota
bisa dilihat, dan kotak saran warga. Konsep lengkap:
[`docs/KONSEP.md`](docs/KONSEP.md).

## Menjalankan (mode demo — tanpa setup)

```bash
npm install
npm run dev
```

Buka http://localhost:3000 — aplikasi jalan dengan **data contoh**
(48 KK, transaksi, saran). Coba:

- Beranda: progress dana live + rekap "X dari Y KK sudah lunas"
- `/undangan`: undangan digital + rundown + **konfirmasi kehadiran (RSVP)**
  — nama yang konfirmasi langsung tampil live sebagai calon tamu
- `/cek-iuran`: ketik nama (mis. *Asep*) atau kode kupon (*MLD-0001*)
  → status + kwitansi digital
- `/laporan`: rincian kas — **klik gambar nota** untuk melihat bukti
- `/kotak-saran`: kirim saran (masuk moderasi dulu)
- `/admin` *(tersembunyi — tidak ada tautan dari situs warga)*:
  - Tambah warga masal (manual / tempel daftar / unggah CSV) →
    kupon berkode unik + QR dibuat otomatis
  - `/admin/kupon`: **cetak kupon massal** siap potong per A4
    (10 kupon/lembar) — QR di kupon menuju halaman cek iuran
  - Tandai kupon lunas → beranda/live update otomatis
  - Rekap konfirmasi kehadiran (RSVP) undangan

## Beralih ke data sungguhan (Supabase — gratis)

1. Buat project di [supabase.com](https://supabase.com)
2. SQL Editor → jalankan seluruh isi [`supabase/schema.sql`](supabase/schema.sql)
3. Salin `.env.example` jadi `.env.local`, isi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Restart `npm run dev` — data kini tersimpan di database

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. [vercel.com](https://vercel.com) → Import project → pilih repo
3. (Penting, biar tidak dicurigai penipuan) **Settings → General →
   Project Name** diganti jadi nama jelas, mis. `maulid-lpj` → alamat
   jadi `maulid-lpj.vercel.app`
4. Environment Variables → isi dua nilai Supabase (sama seperti .env.local)
5. Deploy

## Status pengembangan

- [x] Konsep v2 (`docs/KONSEP.md`) + riset web masjid referensi
      (`docs/REFERENSI.md`)
- [x] Branding masjid di header + **logo masjid asli**
- [x] Halaman publik: beranda live, cek iuran + kwitansi, laporan dengan
      nota bisa dilihat (klik gambar), kotak saran
- [x] **Undangan digital + RSVP live** (rundown, konfirmasi kehadiran,
      daftar calon tamu, rekap di admin)
- [x] Panel panitia tersembunyi (`/admin`, tanpa tautan dari situs warga)
- [x] Tambah warga masal (manual/tempel/CSV) → kupon otomatis
- [x] Cetak kupon massal A4 + QR per kupon
- [ ] Catat pengeluaran + upload bukti foto
- [ ] Login panitia (Supabase Auth)
- [ ] Edit warga (ubah nominal ancalah) & pengaturan lewat UI
- [ ] Jadwal sholat harian (API gratis) + galeri dokumentasi
      (lihat `docs/REFERENSI.md` untuk roadmap lengkap)
