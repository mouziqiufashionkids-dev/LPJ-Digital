# Panduan Deploy — dari Demo ke Web Sungguhan

> Target: web live gratis 100% (Supabase free + Vercel free), dengan
> domain `maulid-alhikmah.vercel.app` yang jelas & meyakinkan bagi warga.
> Waktu pengerjaan: ± 30–45 menit, tanpa biaya.

## Langkah 0 — Siapkan dua akun gratis

1. **GitHub** (kalau belum punya) — github.com
2. **Supabase** — supabase.com (login dengan GitHub)
3. **Vercel** — vercel.com (login dengan GitHub)

## Langkah 1 — Unggah kode ke GitHub

Cara A (paling cepat — lewat berkas zip):
1. Unduh `lpj-digital.zip` dari ruang kerja, ekstrak di komputer
2. Buka terminal/cmd di folder hasil ekstrak:
   ```bash
   git init
   git add .
   git commit -m "LPJ Digital Masjid Al-Hikmah"
   git branch -M main
   git remote add origin https://github.com/USERNAME/LPJ-Digital.git
   git push -u origin main --force
   ```
   (ganti `USERNAME` dengan nama akun GitHub-mu; repo `LPJ-Digital`
   yang lama kosong akan terisi)

## Langkah 2 — Buat database Supabase

1. supabase.com → **New project** → nama: `lpj-alhikmah` →
   pilih region **Singapore** → buat password database (simpan)
2. Tunggu ± 2 menit sampai project aktif
3. Menu **SQL Editor** → **New query** → salin seluruh isi
   `supabase/schema.sql` → **Run**
   (tabel + keamanan RLS + bucket storage "media" otomatis jadi)
4. Menu **Storage** → pastikan bucket `media` ada & **Public**.
    Kalau belum ada: New bucket → nama `media` → centang Public
5. Menu **Project Settings → API**, salin dua nilai:
   - `Project URL`  → ini `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` (secret) → ini `SUPABASE_SERVICE_ROLE_KEY`

## Langkah 3 — Deploy ke Vercel

1. vercel.com → **Add New → Project** → import repo `LPJ-Digital`
2. **PENTING — sebelum deploy**, ganti nama project:
   **Settings → General → Project Name** → `maulid-alhikmah`
   → alamat web menjadi **`maulid-alhikmah.vercel.app`**
   (nama jelas = warga tidak curiga penipuan)
3. **Environment Variables** → tambahkan 3 nilai:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Langkah 2.5 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role dari Langkah 2.5 |
   | `ADMIN_PASSWORD` | sandi panitia buatanmu (GANTI dari default!) |

4. **Deploy** → tunggu ± 2 menit → web live! 🎉

## Langkah 4 — Cek hasil deploy

- [ ] Buka `maulid-alhikmah.vercel.app` — beranda + jadwal sholat tampil
- [ ] Klik logo 3× → login dengan `ADMIN_PASSWORD` baru
- [ ] Tambah warga asli (tempel daftar KK dari Excel)
- [ ] Cetak kupon → bagikan ke juru tagih
- [ ] Sebar link **dari ketua RT/RW ke grup WhatsApp resmi**
      (jangan dari nomor asing — biar tidak dicurigai)
- [ ] Coba kirim saran & konfirmasi undangan dari HP lain

## Catatan penting

- **Data demo vs asli**: begitu env Supabase terisi, web otomatis
  memakai database sungguhan. Data contoh tidak ikut terbawa.
- **Ukuran foto**: maks 4 MB per foto bukti/dokumentasi. Kuota storage
  Supabase free = 1 GB (cukup ± 500 foto).
- **Jadwal sholat** mengambil data kota dari pengaturan `kota_sholat`
  (default: Garut) — bisa diubah di database tabel `pengaturan`.
- **Biaya total**: Rp 0 (free tier cukup untuk kegiatan kampung).
- **Domain sendiri (opsional, nanti)**: beli `.my.id` ± Rp 15–30rb/tahun
  lalu hubungkan di Vercel → Settings → Domains.

## Jika terjadi masalah

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Halaman kosong / error 500 | env Supabase salah | Cek lagi nilai URL & key di Vercel |
| Upload foto gagal | bucket `media` tidak public | Storage → klik `media` → Settings → Public |
| Tidak bisa login admin | `ADMIN_PASSWORD` belum diset | Tambah env di Vercel lalu Redeploy |
| Jadwal sholat tidak tampil | server gagal akses API | normal — kartu otomatis disembunyikan |
