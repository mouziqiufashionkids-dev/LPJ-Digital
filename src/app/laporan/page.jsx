import Link from "next/link";
import { getStats, listTransaksi } from "@/lib/store";
import { rupiah, tanggalSingkat } from "@/lib/format";
import LiveRefresh from "@/components/LiveRefresh";
import NotaImg from "@/components/NotaImg";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Kas — LPJ Maulid Nabi",
};

const TAB = [
  { id: "semua", label: "Semua" },
  { id: "masuk", label: "💰 Dana Masuk" },
  { id: "keluar", label: "💸 Kas Keluar" },
];

export default async function LaporanPage({ searchParams }) {
  const tipe = searchParams?.tipe || "semua";
  const [st, semua] = await Promise.all([getStats(), listTransaksi({})]);
  const rows = tipe === "semua" ? semua : semua.filter((t) => t.tipe === tipe);

  return (
    <main className="mx-auto max-w-3xl px-3 sm:px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-judul text-3xl font-bold text-zamrud-800">
          📊 Laporan Kas Panitia
        </h1>
        <LiveRefresh />
      </div>
      <p className="text-zamrud-900/70 mt-2">
        Semua pemasukan dan pengeluaran tercatat lengkap — dari iuran Rp 50.000
        sampai infak pengusaha. Tidak ada yang disembunyikan.
      </p>

      {/* ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-6">
        <div className="kartu p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-zamrud-700 uppercase tracking-wide">Masuk</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-zamrud-800 break-all leading-tight mt-0.5">
            {rupiah(st.dana_masuk)}
          </p>
        </div>
        <div className="kartu p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-rose-600 uppercase tracking-wide">Keluar</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-rose-600 break-all leading-tight mt-0.5">
            {rupiah(st.dana_keluar)}
          </p>
        </div>
        <div className="kartu p-3 sm:p-4 text-center border-emas/40">
          <p className="text-[10px] sm:text-xs font-semibold text-emas-gelap uppercase tracking-wide">Sisa</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-zamrud-800 break-all leading-tight mt-0.5">
            {rupiah(st.sisa)}
          </p>
        </div>
      </div>

      {/* tombol cetak LPJ lengkap */}
      <div className="mb-4">
        <Link
          href="/laporan/cetak"
          target="_blank"
          className="tombol bg-zamrud-700 text-white hover:bg-zamrud-800 text-sm"
        >
          📄 Cetak LPJ Lengkap (PDF)
        </Link>
      </div>

      {/* tab */}
      <div className="flex flex-wrap gap-2 mt-8">
        {TAB.map((t) => (
          <Link
            key={t.id}
            href={t.id === "semua" ? "/laporan" : `/laporan?tipe=${t.id}`}
            className={`pill border px-4 py-2 ${
              tipe === t.id
                ? "bg-zamrud-600 text-white border-zamrud-600"
                : "bg-white text-zamrud-700 border-zamrud-200 hover:bg-zamrud-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* daftar transaksi */}
      <div className="kartu mt-4 divide-y divide-zamrud-100 overflow-hidden">
        {rows.map((t) => (
          <div key={t.id} className="flex items-center gap-4 px-5 py-4">
            {t.tipe === "keluar" && t.bukti_url ? (
              <NotaImg src={t.bukti_url} alt={`Nota: ${t.keterangan}`} />
            ) : (
              <span className="text-2xl shrink-0">{t.tipe === "masuk" ? "💰" : "📄"}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zamrud-900">{t.keterangan}</p>
              <p className="text-xs text-zamrud-900/50">
                {t.kategori} · {tanggalSingkat(t.tanggal)}
                {t.tipe === "keluar" &&
                  (t.bukti_url ? " · klik nota untuk lihat bukti" : " · ada bukti")}
              </p>
            </div>
            <span
              className={`font-bold shrink-0 ${
                t.tipe === "masuk" ? "text-zamrud-600" : "text-rose-600"
              }`}
            >
              {t.tipe === "masuk" ? "+" : "−"}{rupiah(t.jumlah)}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-5 py-6 text-sm text-zamrud-900/60">Belum ada catatan.</p>
        )}
      </div>

      <p className="text-xs text-zamrud-900/50 mt-4">
        Diperbarui {st.diperbarui} · Setiap pengeluaran disertai nota/bukti foto —
        klik gambar nota untuk melihat detailnya.
      </p>
    </main>
  );
}
