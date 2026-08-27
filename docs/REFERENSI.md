# Riset Web Masjid Referensi — Amati, Tiru, Modifikasi

> Prinsip: tiru yang **relevan untuk masjid desa** dan **gratis / minim
> biaya**. Kita tidak meniru yang mahal atau tidak dibutuhkan warga pelosok.

Situs yang diamati langsung: **Istiqlal** (istiqlal.or.id), **Cut Meutia**
(masjidcutmeutia.com), **Al Falah Surabaya** (masjidalfalah.or.id),
**Agung Al-Azhar** (masjidagungalazhar.com). Masjid Trans & Raya Hasyim
Asy'ari mengikuti pola yang sama (profil + agenda + berita + galeri).

## 1. Pola yang mereka punya → apa yang kita ambil

| Fitur di web masjid besar | Relevan masjid desa? | Biaya | Keputusan |
|---|---|---|---|
| Berita / artikel / khutbah | ✅ bisa, versi ringan | Gratis | ⏳ Tahap berikut — cukup "pengumuman" singkat, bukan portal berita |
| Agenda & kajian rutin | ✅✅ sangat relevan | Gratis | ✅ Struktur sudah ada (tabel `agenda`) — sekarang dipakai untuk rundown undangan |
| **Jadwal sholat harian** (Cut Meutia) | ✅✅✅ **paling menarik** | Gratis (API aladhan.com tanpa kunci) | ⏳ Tahap berikut — alasan warga buka web **setiap hari** |
| Galeri foto kegiatan | ✅✅ | Gratis (Supabase Storage 1 GB) | ⏳ Tahap berikut (dokumentasi) |
| Profil & susunan pengurus (Al Falah) | ✅✅ memperkuat kepercayaan | Gratis | ⏳ Tahap berikut — halaman statis |
| Info infak/sedekah: rekening + QRIS statis | ✅✅ | Gratis (tanpa payment gateway) | ⏳ Bahas dengan pengurus |
| Tautan sosmed (IG/YouTube) | ✅ | Gratis | ⏳ Kalau masjid punya akun |
| Reservasi aula online (Istiqlal, Al-Azhar) | ❌ | Mahal, tak dibutuhkan | Tidak ditiru |
| Layanan kota besar (muallaf center, poliklinik, ambulan, UMKM, wisata religi) | ❌ | Sangat mahal | Tidak ditiru |
| Donasi online payment gateway | ❌ dulu | Biaya transaksi + kompleks | Tidak ditiru — iuran manual + QRIS statis sudah cukup |

## 2. Yang justru TIDAK dimiliki mereka — keunggulan kita

1. **LPJ kas realtime terbuka** — tidak ada satu pun dari keenam web yang
   menampilkan laporan iuran & kas warga secara live dan rinci. Ini fitur
   unik kita dan paling dibutuhkan warga desa.
2. **Kupon iuran ancalah + QR + kwitansi digital** — tidak ada di web masjid
   manapun. Cocok untuk sistem iuran kampung.
3. **Kotak saran warga** & **undangan + konfirmasi kehadiran (RSVP) live** —
   langsung dari kebutuhan panitia kita.
4. **Bahasa sederhana untuk masyarakat awam** — web besar berbahasa formal;
   kita sengaja memakai bahasa yang langsung dipahami warga.

## 3. Kesimpulan arah jangka panjang

Web ini bertumbuh jadi **"satu web untuk semua urusan masjid & warga"**:

```
Sekarang    : LPJ + iuran kupon + undangan RSVP + kotak saran
Tahap 2     : jadwal sholat harian + agenda kajian rutin + galeri
Tahap 3     : profil & pengurus + info infak (rekening/QRIS statis)
Jangka panjang : dipakai ulang tiap kegiatan (Ramadhan, Qurban, iuran bulanan)
```

Kunci strategi dari riset ini: **jadwal sholat + agenda rutin** adalah alasan
warga membuka web *setiap hari* — bukan hanya saat ada acara. Setiap kunjungan
membiasakan warga melihat transparansi kas. Itu efek yang tidak dimiliki
web masjid besar sekalipun.
