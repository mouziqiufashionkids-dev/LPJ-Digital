import Link from "next/link";
import { getSettings, getStats, listTransaksi, listDokumentasi, getKonten } from "@/lib/store";
import { rupiah, tanggalID, tanggalSingkat } from "@/lib/format";
import { isi } from "@/lib/konten";
import ProgressBar from "@/components/ProgressBar";
import StatCard from "@/components/StatCard";
import Countdown from "@/components/Countdown";
import LiveRefresh from "@/components/LiveRefresh";
import NotaImg from "@/components/NotaImg";
import JadwalSholat from "@/components/JadwalSholat";
import FotoGaleri from "@/components/FotoGaleri";

export const dynamic = "force-dynamic";

export default async function Beranda() {
  const [s, st, keluar, dokumentasi, K] = await Promise.all([
    getSettings(),
    getStats(),
    listTransaksi({ tipe: "keluar" }),
    listDokumentasi(),
    getKonten(),
  ]);
  const terbaru = keluar.slice(0, 5);

  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="bg-zamrud-800 bg-ornamen text-krem relative">
        <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:pt-10 sm:pb-20 text-center">
          <p className="pill bg-krem/10 text-emas-terang mb-4">
            ✓ Laporan terverifikasi panitia
          </p>
          <p className="text-sm tracking-[0.2em] uppercase text-emas-terang/90 font-semibold">
            {s.nama_masjid}
          </p>
          <p className="font-judul text-2xl text-emas-terang">﷽</p>
          <h1 className="font-judul font-bold text-2xl sm:text-4xl md:text-5xl mt-3 leading-tight break-words">
            {s.nama_kegiatan}
          </h1>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-krem/85 text-sm sm:text-base md:text-lg leading-relaxed">
            {isi(K["beranda.pembuka"], s)}
          </p>
          <p className="text-xs sm:text-sm text-krem/60 mt-2 leading-snug">
            {tanggalID(s.tanggal_acara)}<br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">{s.lokasi_acara}</span>
          </p>
          <div className="mt-4 sm:mt-6 flex justify-center">
            <Countdown target={s.tanggal_acara} />
          </div>
          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-3 px-2">
            <Link href="/cek-iuran" className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang text-sm sm:text-base w-full sm:w-auto">
              🔍 Cek Iuran Saya
            </Link>
            <Link href="/laporan" className="tombol border-2 border-krem/30 text-krem hover:bg-krem/10 text-sm sm:text-base w-full sm:w-auto">
              📊 Lihat Laporan
            </Link>
          </div>
        </div>
      </section>

      {/* ============ PROGRESS DANA (menimpa hero) ============ */}
      <section className="mx-auto max-w-5xl px-4 -mt-8 sm:-mt-12 relative z-10">
        <div className="kartu p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-judul text-2xl font-bold text-zamrud-800">
              📈 Progress Dana Panitia
            </h2>
            <LiveRefresh />
          </div>
          <ProgressBar
            terkumpul={st.dana_masuk}
            target={st.target_dana}
            kkLunas={st.kk_lunas}
            kkTotal={st.kk_total}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <StatCard
              ikon="💰"
              label="Dana Masuk"
              nilai={rupiah(st.dana_masuk)}
              catatan={`${st.transaksi_masuk} catatan iuran & infak`}
            />
            <StatCard
              ikon="💸"
              label="Kas Keluar"
              nilai={rupiah(st.dana_keluar)}
              catatan={`${st.transaksi_keluar} transaksi · semua berbukti`}
              aksen="merah"
            />
            <StatCard
              ikon="🧮"
              label="Sisa Kas Panitia"
              nilai={rupiah(st.sisa)}
              catatan="masuk − keluar, realtime"
              aksen="emas"
            />
          </div>
          <p className="text-xs text-zamrud-900/50 mt-4">
            Diperbarui {st.diperbarui} · Sumber: iuran ancalah warga + infak
            sukarela. Rincian lengkap di{" "}
            <Link href="/laporan" className="font-semibold underline">
              halaman Laporan
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ============ JADWAL SHOLAT ============ */}
      <JadwalSholat kota={s.kota_sholat || "Garut"} />

      {/* ============ PENGELUARAN TERBARU ============ */}
      <section className="mx-auto max-w-5xl px-4 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-judul text-2xl font-bold text-zamrud-800">
            💸 Pengeluaran Terbaru
          </h2>
          <Link href="/laporan?tipe=keluar" className="text-sm font-semibold text-zamrud-600 hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="kartu divide-y divide-zamrud-100 overflow-hidden">
          {terbaru.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4">
              {t.bukti_url ? (
                <NotaImg src={t.bukti_url} alt={`Nota: ${t.keterangan}`} kecil />
              ) : (
                <span className="text-2xl">📄</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zamrud-900 truncate">{t.keterangan}</p>
                <p className="text-xs text-zamrud-900/50">
                  {t.kategori} · {tanggalSingkat(t.tanggal)} ·{" "}
                  {t.bukti_url ? "klik nota untuk lihat bukti" : "ada bukti"}
                </p>
              </div>
              <span className="font-bold text-rose-600 shrink-0">{rupiah(t.jumlah)}</span>
            </div>
          ))}
          {terbaru.length === 0 && (
            <p className="px-5 py-6 text-sm text-zamrud-900/60">Belum ada pengeluaran.</p>
          )}
        </div>
      </section>

      {/* ============ TIGA AJAKAN ============ */}
      <section className="mx-auto max-w-5xl px-4 mt-10 grid md:grid-cols-3 gap-5">
        <div className="kartu p-6 border-emas/50 bg-amber-50/60">
          <p className="text-3xl">💌</p>
          <h3 className="font-judul text-xl font-bold text-zamrud-800 mt-2">
            Undangan Maulid Nabi
          </h3>
          <p className="text-sm text-zamrud-900/70 mt-1">
            Lihat rundown acara dan konfirmasi kehadiran Anda — nama langsung
            tercatat sebagai calon tamu.
          </p>
          <Link href="/undangan" className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang mt-4">
            Buka Undangan
          </Link>
        </div>
        <div className="kartu p-6 bg-zamrud-50 border-zamrud-100">
          <p className="text-3xl">✅</p>
          <h3 className="font-judul text-xl font-bold text-zamrud-800 mt-2">
            Sudah bayar iuran?
          </h3>
          <p className="text-sm text-zamrud-900/70 mt-1">
            Pastikan iuran Anda sudah tercatat oleh panitia. Ketik nama Anda,
            lihat statusnya, dan simpan kwitansi digitalnya.
          </p>
          <Link href="/cek-iuran" className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 mt-4">
            Cek Sekarang
          </Link>
        </div>
        <div className="kartu p-6">
          <p className="text-3xl">📮</p>
          <h3 className="font-judul text-xl font-bold text-zamrud-800 mt-2">
            Ada saran untuk panitia?
          </h3>
          <p className="text-sm text-zamrud-900/70 mt-1">
            Suara warga membuat kegiatan lebih baik. Boleh anonim, dibaca
            langsung oleh panitia.
          </p>
          <Link href="/kotak-saran" className="tombol border-2 border-zamrud-600 text-zamrud-700 hover:bg-zamrud-50 mt-4">
            Buka Kotak Saran
          </Link>
        </div>
      </section>

      {/* ============ GALERI DOKUMENTASI ============ */}
      {dokumentasi.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-judul text-2xl font-bold text-zamrud-800">
              📷 Dokumentasi Kegiatan
            </h2>
          </div>
          <FotoGaleri daftar={dokumentasi} />
        </section>
      )}

      {/* ============ VERIFIKASI ============ */}
      <section className="mx-auto max-w-5xl px-4 mt-10">
        <div className="kartu p-6 border-emas/40 bg-amber-50/60">
          <h2 className="font-judul text-xl font-bold text-zamrud-800">
            🛡️ Ini web resmi panitia — bukan penipuan
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-zamrud-900/80 list-disc pl-5">
            {String(K["beranda.verifikasi"] || "")
              .split("\n")
              .filter(Boolean)
              .map((baris, i) => (
                <li key={i}>{isi(baris, s)}</li>
              ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
