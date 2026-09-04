# 📌 Catatan Perjalanan (Sticky Notes) — Web LPJ DKM Masjid Al-Hikmah

> Dokumentasi alur pembuatan web dari 0 sampai paripurna

---

## 🟡 STICKY #1 — Asbabun Nuzul (Latar Belakang)

**"Warga minta transparansi, panitia kewalahan dengan Excel."**

- Warga sering bertanya: "Uang iuran saya sudah masuk belum?"
- Bendahara harus buka Excel satu-satu tiap ditanya
- Ada kecurigaan dari warga luar yang takut "domain aneh = penipuan"
- Warga sebelah sudah pakai web serupa (SIMSALABIM untuk HUT RI)
- **Ide lahir:** digitalisasi laporan kas supaya semua warga bisa lihat realtime

**Status:** ✅ Selesai dicatat

---

## 🟡 STICKY #2 — Penentuan Prioritas (MVP)

**"Apa yang PALING dibutuhkan dulu?"**

| Prioritas | Fitur | Alasan |
|---|---|---|
| 🔴 Wajib | LPJ kas realtime | Inti permintaan warga |
| 🔴 Wajib | Cek iuran per nama | Warga cek sendiri tanpa tanya bendahara |
| 🟡 Penting | Kupon iuran cetak | Sistem ancalah per kelas (150rb/100rb/75rb) |
| 🟡 Penting | Undangan + RSVP | Estimasi tamu untuk konsumsi |
| 🟢 Bonus | Kotak saran | Suara warga |
| 🟢 Bonus | Proposal sponsor | Cari dana tambahan |

**Status:** ✅ Prioritas disepakati

---

## 🟡 STICKY #3 — Jadwal & Milestone

**"Target: selesai sebelum Maulid 11 September 2026"**

| Minggu | Target | Hasil |
|---|---|---|
| 27-28 Agu | Kerangka + halaman publik + admin | ✅ Selesai |
| 28-29 Agu | Database + deploy + data asli | ✅ Selesai |
| 29-30 Agu | Polish: mobile, notifikasi WA, fitur lanjutan | ✅ Selesai |

**Status:** ✅ Semua milestone tercapai

---

## 🟡 STICKY #4 — Bekerja Fokus (Sprint Logs)

**Sprint 1 — Fondasi (27 Agu)**
- [x] Setup Next.js + Tailwind + tema islami
- [x] Halaman beranda dengan progress bar live
- [x] Cek iuran dengan kwitansi digital
- [x] Laporan kas dengan nota bukti
- [x] Kotak saran dengan moderasi

**Sprint 2 — Sistem Kupon (28 Agu)**
- [x] Kupon per kelas (1/2/3/Sponsor)
- [x] Upload Excel massal (SheetJS)
- [x] Cetak kupon A4 dengan QR
- [x] Kirim kupon via WhatsApp individual

**Sprint 3 — Database & Deploy (28-29 Agu)**
- [x] Supabase + schema SQL
- [x] Deploy Vercel dengan domain dkm-alhikmah.vercel.app
- [x] Upload 81 KK data asli
- [x] Setup sandi admin

**Sprint 4 — Penyempurnaan (29 Agu)**
- [x] Notifikasi WA otomatis ke grup (Fonnte)
- [x] Mode gelap
- [x] Ekspor LPJ PDF
- [x] Rekap per RT
- [x] Rekap harian otomatis (cron 20:00 WIB)
- [x] Rencana anggaran (RAB)
- [x] Social proof (tamu ticker + saran marquee)
- [x] Banner & konten Instagram
- [x] Edit warga & transaksi
- [x] Layout mobile responsif

**Status:** ✅ 10 sprint selesai

---

## 🟡 STICKY #5 — Catatan Ide (Backlog)

**Ide yang muncul di tengah jalan:**

| Ide | Status |
|---|---|
| PWA (install sebagai app) | ⏳ Ditunda sesuai permintaan |
| Multi-admin dengan role | ⏳ Backlog |
| Grafik tren dana | ⏳ Backlog |
| Template multi-kegiatan | ⏳ Backlog (untuk Ramadhan/qurban) |
| Reminder iuran via WA | ⏳ Backlog |
| Live agenda status | ⏳ Backlog |

**Status:** 📝 Dicatat untuk masa depan

---

## 🟡 STICKY #6 — Evaluasi & Pembelajaran

**Apa yang berjalan baik:**
- ✅ Deploy cepat lewat Vercel + GitHub
- ✅ Data langsung masuk dari Excel — tidak perlu ketik manual
- ✅ Warga langsung bisa cek iuran sendiri
- ✅ Notifikasi otomatis ke grup WA sangat membantu

**Tantangan yang dihadapi:**
- ⚠️ Next.js men-cache fetch internal Supabase → data "muncul-hilang" — selesai dengan `no-store`
- ⚠️ Cache browser menampilkan versi lama → solusi: refresh paksa (Ctrl+Shift+R)
- ⚠️ Dua sesi Arena berjalan serentak → saling menimpa data — selesai dengan menutup satu sesi
- ⚠️ CallMeBot tidak stabil → ganti ke Fonnte (buatan Indonesia, lebih reliabel)
- ⚠️ CSS nyasar di JSX menyebabkan build gagal → Vercel tetap serve versi lama

**Pelajaran:**
- Selalu cek `viewport` meta tag sejak awal untuk mobile
- Pakai `no-store` di semua fetch Supabase dari awal
- Satu sesi saja yang mengerjakan — tidak dua tangan masak di satu panci
- Test build lokal sebelum push ke production

**Status:** ✅ Dievaluasi & dicatat

---

## 🟡 STICKY #7 — Angka Akhir

| Metrik | Nilai |
|---|---|
| Total commit | 30+ |
| Halaman publik | 6 |
| Fitur admin | 6 |
| API endpoints | 18 |
| Komponen React | 27 |
| Total warga | 81 KK |
| Sponsor | 3 orang |
| Target dana | Rp 8.725.000 |
| Notifikasi WA | Otomatis ke grup |
| Deploy | dkm-alhikmah.vercel.app |

**Status:** ✅ Paripurna

---

*Dibuat dengan penuh dedikasi untuk warga DKM Masjid Al-Hikmah · 2026*
