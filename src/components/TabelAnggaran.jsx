// Tabel rencana anggaran biaya — ditampilkan di Proposal & LPJ Cetak
import { rupiah } from "@/lib/format";

export default function TabelAnggaran({ judul, isi, totalDanaTersedia }) {
  if (!isi || !isi.trim()) return null;

  const baris = isi
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      // format: "keterangan | Rp nominal" atau "keterangan | nominal"
      const parts = b.split("|");
      const keterangan = (parts[0] || "").trim();
      const nominalStr = (parts[1] || "").replace(/[^0-9]/g, "");
      return { keterangan, nominal: Number(nominalStr) || 0 };
    })
    .filter((b) => b.keterangan);

  if (!baris.length) return null;

  const totalAnggaran = baris.reduce((a, b) => a + b.nominal, 0);
  const selisih = (totalDanaTersedia || 0) - totalAnggaran;

  return (
    <section className="mt-8">
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mb-4">
        📋 {judul || "Rencana Anggaran"}
      </h2>

      <div className="kartu overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zamrud-800 text-krem text-left">
              <th className="px-4 py-3 font-semibold">No</th>
              <th className="px-4 py-3 font-semibold">Kebutuhan / Biaya</th>
              <th className="px-4 py-3 font-semibold text-right">Estimasi Biaya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zamrud-100">
            {baris.map((b, i) => (
              <tr key={i} className="hover:bg-zamrud-50/50">
                <td className="px-4 py-3 text-zamrud-900/50">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-zamrud-900">{b.keterangan}</td>
                <td className="px-4 py-3 text-right font-semibold text-zamrud-800">
                  {rupiah(b.nominal)}
                </td>
              </tr>
            ))}
            <tr className="bg-zamrud-50 border-t-2 border-zamrud-600">
              <td colSpan={2} className="px-4 py-3 font-bold text-zamrud-800 text-right">
                TOTAL ANGGARAN
              </td>
              <td className="px-4 py-3 text-right font-bold text-zamrud-800">
                {rupiah(totalAnggaran)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Perbandingan dengan dana tersedia */}
      {totalDanaTersedia > 0 && (
        <div
          className={`kartu p-4 mt-3 text-sm ${
            selisih >= 0
              ? "border-zamrud-200 bg-zamrud-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-zamrud-900/70">
              Dana terkumpul: <strong className="text-zamrud-800">{rupiah(totalDanaTersedia)}</strong>
            </span>
            <span
              className={`font-bold ${
                selisih >= 0 ? "text-zamrud-700" : "text-rose-600"
              }`}
            >
              {selisih >= 0
                ? ` surplus ${rupiah(selisih)}`
                : ` kurang ${rupiah(Math.abs(selisih))}`}
            </span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-zamrud-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                selisih >= 0 ? "bg-zamrud-600" : "bg-rose-500"
              }`}
              style={{
                width: `${Math.min(100, (totalDanaTersedia / totalAnggaran) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-zamrud-900/50 mt-1.5">
            {Math.round((totalDanaTersedia / totalAnggaran) * 100)}% dari total anggaran terpenuhi
          </p>
        </div>
      )}
    </section>
  );
}
