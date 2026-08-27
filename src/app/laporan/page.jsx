import Link from "next/link";
import { getStats, listTransaksi } from "@/lib/store";
import { rupiah, tanggalSingkat } from "@/lib/format";
import LiveRefresh from "@/components/LiveRefresh";

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
    <main className="mx-auto max-w-3xl px-4 py-10">
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
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="kartu p-4 text-center">
          <p className="text-xs font-semibold text-zamrud-700">MASUK</p>
          <p className="text-lg md:text-xl font-bold text-zamrud-800">
            {rupiah(st.dana_masuk)}
          </p>
        </div>
        <div className="kartu p-4 text-center">
          <p className="text-xs font-semibold text-rose-600">KELUAR</p>
          <p className="text-lg md:text-xl font-bold text-rose-600">
            {rupiah(st.dana_keluar)}
          </p>
        </div>
        <div className="kartu p-4 text-center border-emas/40">
          <p className="text-xs font-semibold text-emas-gelap">SISA</p>
          <p className="text-lg md:text-xl font-bold text-zamrud-800">
            {rupiah(st.sisa)}
          </p>
        </div>
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
            <span className="text-2xl shrink-0">{t.tipe === "masuk" ? "💰" : "📄"}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zamrud-900">{t.keterangan}</p>
              <p className="text-xs text-zamrud-900/50">
                {t.kategori} · {tanggalSingkat(t.tanggal)}
                {t.tipe === "keluar" && " · ada bukti"}
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
        Diperbarui {st.diperbarui} · Setiap pengeluaran disertai foto bukti
        (nota/kwitansi) yang bisa diminta warga kepada panitia.
      </p>
    </main>
  );
}
