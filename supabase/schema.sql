-- ===================================================================
-- LPJ MAULID NABI — Skema database Supabase
-- Jalankan seluruh file ini di SQL Editor project Supabase Anda.
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
-- (jika gagal lewat SQL, buat manual: Storage -> New bucket -> nama "media", Public)
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
  ancalah bigint not null default 0,   -- rupiah, tanpa titik
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
  tampil boolean not null default false,      -- disetujui panitia
  ditindaklanjuti boolean not null default false,
  created_at timestamptz not null default now()
);

-- Panitia (profil pengelola, untuk halaman verifikasi)
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

-- ===================================================================
-- Keamanan (RLS)
--  - Publik (anon): hanya boleh BACA data yang ditampilkan di web
--  - Warga (anon): boleh MENGIRIM kotak saran
--  - Tulis data lain: lewat service role (server Next.js)
-- ===================================================================
alter table pengaturan   enable row level security;
alter table warga        enable row level security;
alter table kupon        enable row level security;
alter table transaksi    enable row level security;
alter table kotak_saran  enable row level security;
alter table rsvp         enable row level security;
alter table panitia      enable row level security;
alter table agenda       enable row level security;
alter table dokumentasi  enable row level security;

create policy "baca pengaturan"  on pengaturan  for select using (true);
create policy "baca warga"       on warga       for select using (true);
create policy "baca kupon"       on kupon       for select using (true);
create policy "baca transaksi"   on transaksi   for select using (true);
create policy "baca saran"       on kotak_saran for select using (tampil = true);
create policy "baca rsvp"        on rsvp        for select using (kehadiran in ('hadir','belum_pasti'));
create policy "baca panitia"     on panitia     for select using (true);
create policy "baca agenda"      on agenda      for select using (true);
create policy "baca dokumentasi" on dokumentasi for select using (true);

create policy "kirim saran" on kotak_saran for insert with check (char_length(pesan) between 3 and 500);
create policy "kirim rsvp"  on rsvp        for insert with check (char_length(nama) between 2 and 80);
