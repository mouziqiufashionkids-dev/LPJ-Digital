# 🤝 Panduan Berkontribusi

Terima kasih ingin membantu! Proyek ini dibuat untuk umat — semua
kontribusi berharga.

## Cara kontribusi

1. **Fork** repo ini, buat branch baru (`fitur-namaanda`)
2. Kerjakan perubahan, uji dulu di mode demo (`npm install && npm run dev`)
3. Pastikan `npm run build` sukses tanpa error
4. Buat **Pull Request** dengan deskripsi jelas + tangkapan layar bila perlu

## Jenis kontribusi yang dicari

- 🐛 Perbaikan bug
- 🌐 Terjemahan (EN version of docs)
- ♿ Aksesibilitas (screen reader, kontras warna)
- 🎨 Tema/vari warna baru (mis. nuansa biru/putih untuk selain tema hijau-emas)
- ✨ Fitur: ekspor Excel, kwitansi PDF, multi-kegiatan, dsb.
- 📝 Perbaikan dokumentasi & panduan

## Standar kode

- Bahasa komentar & UI: **Bahasa Indonesia** (audiens: panitia masjid)
- Sisi klien: React/Next.js; akses data **selalu lewat `src/lib/store.js`**
  (jangan impor Supabase langsung di halaman/komponen — biar mode demo tetap jalan)
- Semua fetch data: `cache: "no-store"` (pelajaran dari kasus data basi 😄)
- Jangan pernah commit `.env`, token, atau sandi apa pun

## Kode etak

Santun, saling menghormati, dan niatkan untuk ibadah. 🌙
