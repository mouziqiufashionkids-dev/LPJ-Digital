# LPJ Digital — Maulid Nabi ﷺ

Laporan pertanggungjawaban digital kegiatan Maulid Nabi: kupon iuran
(ancalah) otomatis, progress dana live, kas keluar berbukti, dan kotak
saran warga. Konsep lengkap: [`docs/KONSEP.md`](docs/KONSEP.md).

## Menjalankan (mode demo — tanpa setup)

```bash
npm install
npm run dev
```

Buka http://localhost:3000 — aplikasi jalan dengan **data contoh**
(48 KK, transaksi, saran). Coba:

- Beranda: progress dana live + rekap "X dari Y KK sudah lunas"
- `/cek-iuran`: ketik nama (mis. *Asep*) → status + kwitansi digital
- `/laporan`: rincian kas masuk & keluar
- `/kotak-saran`: kirim saran (masuk moderasi dulu)
- `/admin`: tandai kupon lunas → beranda/live update otomatis

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

- [x] Konsep v2 (`docs/KONSEP.md`)
- [x] Halaman publik: beranda live, cek iuran + kwitansi, laporan, kotak saran
- [x] Panel panitia dasar: tandai lunas, moderasi saran
- [ ] Kelola warga ( impor daftar KK, nominal bertingkat ) + generate kupon
- [ ] Desain & cetak kupon (A4, potong) — diulik bersama
- [ ] Catat pengeluaran + upload bukti foto
- [ ] Login panitia (Supabase Auth)
- [ ] Agenda acara & dokumentasi foto
