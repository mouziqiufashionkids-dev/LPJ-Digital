-- ===================================================================
-- PERBAIKI & PASTIKAN SKEMA LENGKAP — AMAN DIJALANKAN BERULANG KALI
-- (memastikan database lengkap walau SQL pernah dijalankan sebelumnya
--  atau memakai versi lama)
-- Jalankan SEKALI lagi di SQL Editor, lalu lihat hasil di baris paling
-- bawah — semua angka harus bernilai 1.
-- ===================================================================

-- ---------- 1) tabel (otomatis dilewati kalau sudah ada) ----------
create table if not exists pengaturan (
  id int primary key default 1,
  nama_masjid text not null default 'Masjid Al-Hikmah',
  nama_kegiatan text not null default 'Maulid Nabi ﷺ',
  hijriah text default 'Rabiul Awal 1448 H',
  penyelenggara text,
  penyelenggara_singkat text,
  lokasi_acara text,
  tanggal_acara timestamptz,
  kontak_wa text
);
create table if not exists warga (
  id bigint generated always as identity primary key,
  nama text not null,
  rt text,
  alamat text,
  ancalah bigint not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);
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
create table if not exists rsvp (
  id bigint generated always as identity primary key,
  nama text not null,
  rt text,
  kehadiran text not null check (kehadiran in ('hadir','belum_pasti','berhalangan')),
  jumlah_tamu int not null default 1,
  catatan text,
  created_at timestamptz not null default now()
);
create table if not exists kotak_saran (
  id bigint generated always as identity primary key,
  nama text,
  pesan text not null,
  tampil boolean not null default false,
  ditindaklanjuti boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists konten (
  kunci text primary key,
  nilai text not null,
  diperbarui timestamptz not null default now()
);
create table if not exists panitia (
  id bigint generated always as identity primary key,
  nama text not null,
  jabatan text,
  foto_url text,
  urutan int default 0
);
create table if not exists agenda (
  id bigint generated always as identity primary key,
  waktu text,
  judul text not null,
  lokasi text,
  keterangan text
);
create table if not exists dokumentasi (
  id bigint generated always as identity primary key,
  judul text,
  foto_url text not null,
  created_at timestamptz not null default now()
);

-- ---------- 2) kolom baru (kalau belum ada, ditambahkan) ----------
alter table pengaturan add column if not exists kota_sholat text default 'Garut';
alter table pengaturan add column if not exists rekening_bank text;
alter table pengaturan add column if not exists rekening_no text;
alter table pengaturan add column if not exists rekening_atas_nama text;
alter table pengaturan add column if not exists qris_url text;
alter table warga add column if not exists kelas text default '3';

-- ---------- 3) baris pengaturan awal ----------
insert into pengaturan (id, nama_masjid, nama_kegiatan, penyelenggara, penyelenggara_singkat, lokasi_acara, tanggal_acara, kontak_wa, kota_sholat, rekening_bank, rekening_no, rekening_atas_nama)
values (1, 'Masjid Al-Hikmah', 'Maulid Nabi ﷺ 1448 H', '[Nama RT/RW · Kampung]', 'RT/RW · Kampung Anda', 'Balai Warga & Masjid Al-Hikmah', '2026-09-05 01:00:00+00', '628123456789', 'Garut', '[Nama Bank]', '[Nomor Rekening]', '[Atas Nama]')
on conflict (id) do nothing;

-- ---------- 4) bucket foto (publik) ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ---------- 5) keamanan RLS ----------
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

-- ---------- 6) kebijakan akses (buang lalu buat ulang — aman diulang) ----------
drop policy if exists "baca pengaturan"  on pengaturan;
drop policy if exists "baca warga"       on warga;
drop policy if exists "baca kupon"       on kupon;
drop policy if exists "baca transaksi"   on transaksi;
drop policy if exists "baca saran"       on kotak_saran;
drop policy if exists "baca rsvp"        on rsvp;
drop policy if exists "baca panitia"     on panitia;
drop policy if exists "baca agenda"      on agenda;
drop policy if exists "baca dokumentasi" on dokumentasi;
drop policy if exists "baca konten"      on konten;
drop policy if exists "kirim saran"      on kotak_saran;
drop policy if exists "kirim rsvp"       on rsvp;

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

-- ---------- 7) VERIFIKASI: semua harus bernilai 1 ----------
select
  (select count(*) from information_schema.tables where table_name = 'pengaturan')   as pengaturan,
  (select count(*) from information_schema.tables where table_name = 'warga')        as warga,
  (select count(*) from information_schema.tables where table_name = 'kupon')        as kupon,
  (select count(*) from information_schema.tables where table_name = 'transaksi')    as transaksi,
  (select count(*) from information_schema.tables where table_name = 'rsvp')         as rsvp,
  (select count(*) from information_schema.tables where table_name = 'kotak_saran')  as saran,
  (select count(*) from information_schema.tables where table_name = 'konten')       as konten,
  (select count(*) from information_schema.tables where table_name = 'agenda')       as agenda,
  (select count(*) from information_schema.tables where table_name = 'dokumentasi')  as dokumentasi,
  (select count(*) from information_schema.columns where table_name = 'warga' and column_name = 'kelas') as kolom_kelas,
  (select count(*) from information_schema.columns where table_name = 'pengaturan' and column_name = 'rekening_no') as kolom_rekening,
  (select count(*) from pg_policies where policyname = 'kirim rsvp') as kebijakan_rsvp;
