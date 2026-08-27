# 📱 Panduan Setup Website — TANPA TERMINAL

> Semua langkah di bawah ini dilakukan lewat BROWSER (bisa dari HP),
> tinggal klik & salin-tempel. Tidak ada perintah terminal sama sekali.
> Urutannya: A → B → C → D → E. Total ± 20 menit.

---

## A. GANTI SANDI ADMIN (paling penting — 2 menit)

Sandi admin saat ini masih bawaan (`alhikmah2026`) dan diketahui publik.

1. Buka **vercel.com** → login → klik project **lpj-digital**
2. Klik tab **Settings** (di menu atas)
3. Klik **Environment Variables** (menu kiri)
4. Isi kolom yang muncul:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** sandi rahasia buatanmu (contoh: `H1km4h-M4ul1d-2026`)
5. Pastikan pilih **All Environments** → klik **Save**

✅ Selesai. Nanti di langkah E web akan dinyalakan ulang supaya sandi baru aktif.

---

## B. BUAT DATABASE SUPABASE (10 menit)

Sekarang web masih pakai **data contoh** — perlu database agar data asli tersimpan.

1. Buka **supabase.com** → klik **Start your project** → login dengan GitHub
2. Klik **New project**:
   - Name: `lpj-alhikmah`
   - Database Password: buat sandi → **CATAT/SAVE sandi ini**
   - Region: pilih **Singapore** (terdekat)
   - Klik **Create new project** → tunggu ± 2 menit
3. Setelah jadi, klik menu **SQL Editor** (ikon 🗄️, kiri atas)
4. Klik **New query**
5. **Salin SELURUH teks di kotak bawah ini**, tempel ke kolom SQL Editor:

```sql
-- ===================================================================
-- LPJ MAULID NABI — Skema database Supabase
-- ===================================================================

-- Pengaturan umum (satu baris, id = 1)
create table if not exists pengaturan (
  id int primary key default 1,
  nama_masjid text not null default 'Masjid Al-Hikmah',
  nama_kegiatan text not null default 'Maulid Nabi ﷺ',
  hijriah text default 'Rabiul Awal 1448 H',
  penyelenggara text,
  penyelenggara_singkat text,
  lokasi_acara text,
  tanggal_acara timestamptz,
  kontak_wa text,
  kota_sholat text default 'Garut',
  rekening_bank text,
  rekening_no text,
  rekening_atas_nama text,
  qris_url text
);
insert into pengaturan (id, nama_masjid, nama_kegiatan, penyelenggara, penyelenggara_singkat, lokasi_acara, tanggal_acara, kontak_wa, kota_sholat, rekening_bank, rekening_no, rekening_atas_nama)
values (1, 'Masjid Al-Hikmah', 'Maulid Nabi ﷺ 1448 H', '[Nama RT/RW · Kampung]', 'RT/RW · Kampung Anda', 'Balai Warga & Masjid Al-Hikmah', '2026-09-05 01:00:00+00', '628123456789', 'Garut', '[Nama Bank]', '[Nomor Rekening]', '[Atas Nama]')
on conflict (id) do nothing;

-- Bucket storage publik untuk foto bukti & dokumentasi
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Warga penerima ancalah (per KK)
create table if not exists warga (
  id bigint generated always as identity primary key,
  nama text not null,
  rt text,
  alamat text,
  kelas text default '3' check (kelas in ('1','2','3','sponsor')),
  ancalah bigint not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- Kupon iuran (satu kupon per warga untuk kegiatan ini)
create table if not exists kupon (
  id bigint generated always as identity primary key,
  warga_id bigint not null references warga(id) on delete cascade,
  kode text not null unique,
  nominal bigint not null default 0,
  status text not null default 'belum' check (status in ('belum','lunas')),
  tanggal_bayar date,
  metode text,
  petugas text,
  created_at timestamptz not null default now()
);

-- Semua arus kas
create table if not exists transaksi (
  id bigint generated always as identity primary key,
  tanggal date not null,
  tipe text not null check (tipe in ('masuk','keluar')),
  jumlah bigint not null,
  kategori text,
  keterangan text,
  bukti_url text,
  kupon_id bigint references kupon(id) on delete set null,
  dicatat_oleh text default 'bendahara',
  created_at timestamptz not null default now()
);

-- Konfirmasi kehadiran undangan (RSVP)
create table if not exists rsvp (
  id bigint generated always as identity primary key,
  nama text not null,
  rt text,
  kehadiran text not null check (kehadiran in ('hadir','belum_pasti','berhalangan')),
  jumlah_tamu int not null default 1,
  catatan text,
  created_at timestamptz not null default now()
);

-- Kotak saran warga
create table if not exists kotak_saran (
  id bigint generated always as identity primary key,
  nama text,
  pesan text not null,
  tampil boolean not null default false,
  ditindaklanjuti boolean not null default false,
  created_at timestamptz not null default now()
);

-- Teks halaman yang bisa diedit panitia
create table if not exists konten (
  kunci text primary key,
  nilai text not null,
  diperbarui timestamptz not null default now()
);

-- Panitia (profil pengelola)
create table if not exists panitia (
  id bigint generated always as identity primary key,
  nama text not null,
  jabatan text,
  foto_url text,
  urutan int default 0
);

-- Agenda kegiatan
create table if not exists agenda (
  id bigint generated always as identity primary key,
  waktu text,
  judul text not null,
  lokasi text,
  keterangan text
);

-- Dokumentasi foto
create table if not exists dokumentasi (
  id bigint generated always as identity primary key,
  judul text,
  foto_url text not null,
  created_at timestamptz not null default now()
);

-- ================= KEAMANAN (RLS) =================
alter table pengaturan   enable row level security;
alter table warga        enable row level security;
alter table kupon        enable row level security;
alter table transaksi    enable row level security;
alter table kotak_saran  enable row level security;
alter table rsvp         enable row level security;
alter table panitia      enable row level security;
alter table agenda       enable row level security;
alter table dokumentasi  enable row level security;
alter table konten       enable row level security;

create policy "baca pengaturan"  on pengaturan  for select using (true);
create policy "baca warga"       on warga       for select using (true);
create policy "baca kupon"       on kupon       for select using (true);
create policy "baca transaksi"   on transaksi   for select using (true);
create policy "baca saran"       on kotak_saran for select using (tampil = true);
create policy "baca rsvp"        on rsvp        for select using (kehadiran in ('hadir','belum_pasti'));
create policy "baca panitia"     on panitia     for select using (true);
create policy "baca agenda"      on agenda      for select using (true);
create policy "baca dokumentasi" on dokumentasi for select using (true);
create policy "baca konten"      on konten      for select using (true);

create policy "kirim saran" on kotak_saran for insert with check (char_length(pesan) between 3 and 500);
create policy "kirim rsvp"  on rsvp        for insert with check (char_length(nama) between 2 and 80);
```

6. Klik tombol **Run** (hijau, kanan bawah) → tunggu tulisan "Success"
7. Cek menu **Storage** (kiri) → pastikan ada bucket bernama **media**
    → klik media → Settings → pastikan **Public bucket** aktif ✓

### Salin 2 kunci rahasia:

8. Klik ikon ⚙️ **Project Settings** (kiri bawah) → **API**
9. **Salin dan simpan** dua nilai ini (klik ikon salin):
   - **Project URL** — diawali `https://` dan diakhiri `.supabase.co`
   - **service_role** key — teks panjang (ADA di bagian "Project API keys",
     pilih yang bernama `service_role`, bukan `anon`!)

---

## C. PASANG KUNCI DI VERCEL (3 menit)

1. Kembali ke **vercel.com** → project lpj-digital → **Settings** →
   **Environment Variables**
2. Tambah dua baris baru (tombol **Add**):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari langkah B.9 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key dari langkah B.9 |

3. Save keduanya. Sekarang total ada **3** env var (termasuk ADMIN_PASSWORD).

---

## D. GANTI NAMA DOMAIN (1 menit)

1. Masih di Settings → klik **General** (paling atas menu kiri)
2. Cari tulisan **Project Name** → klik **Edit**
3. Hapus `lpj-digital`, ketik: **`dkm-alhikmah`**
4. Klik **Save**
5. Selesai! Domain baru: **`dkm-alhikmah.vercel.app`**
   (domain lama lpj-digital.vercel.app otomatis nonaktif)

---

## E. NYALAKAN ULANG WEB (Redeploy — 2 menit)

Supaya sandi baru + database terbaca:

1. Klik tab **Deployments** (menu atas project)
2. Klik baris deployment paling atas (yang ada label "Production")
3. Klik tombol **⋯** (tiga titik) di kanan → pilih **Redeploy**
4. Klik **Redeploy** lagi → tunggu ± 2 menit sampai status **Ready** ✓

---

## F. VERIFIKASI & MULAI PAKAI (5 menit)

Buka **dkm-alhikmah.vercel.app**, cek:

- [ ] Footer TIDAK lagi ada tulisan "Mode demo — data contoh"
- [ ] Klik logo 3× → login pakai **sandi baru** (bukan alhikmah2026)
- [ ] Buka ⚙ Pengaturan Web → isi data asli: penyelenggara, rekening
      masjid, nomor WA bendahara, rundown acara → Simpan
- [ ] Hapus semua warga contoh (tombol Hapus di tabel — atau tunggu,
      lebih cepat: kabari saya, nanti saya bersihkan lewat SQL)
- [ ] Tambah Warga → Unggah Excel data asli → Cetak Kupon per kelas
- [ ] Cetak kupon SUDAH di domain baru (QR mengikuti domain baru ✓)
- [ ] Bagikan link dari ketua RT/RW ke grup WhatsApp resmi

---

## SETELAH INI: sehari-hari TANPA terminal, TANPA koding

Semua pengelolaan rutin cukup lewat **panel admin dari HP**:

| Kebutuhan | Cara |
|---|---|
| Catat iuran masuk / kas keluar | Panel → Catat Transaksi |
| Tambah/ubah warga | Panel → Tambah Warga (unggah Excel) |
| Cetak kupon | Panel → tombol Cetak Kupon |
| Ubah rundown/teks/rekening/WA | Panel → ⚙ Pengaturan Web |
| Lihat saran & RSVP | Panel → scroll ke bawah |

Terminal hanya dibutuhkan kalau mau **mengubah programnya sendiri**
(fitur baru). Untuk itu, kabari saya — kita kerjakan di sini seperti biasa.
