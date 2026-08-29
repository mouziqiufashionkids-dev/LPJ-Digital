import { getSettings, getStats, listTransaksi, listWarga } from "@/lib/store";
import { rupiah, tanggalID, tanggalSingkat } from "@/lib/format";
import TabelAnggaran from "@/components/TabelAnggaran";
import { getKonten } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cetak LPJ — Masjid Al-Hikmah",
};

// Halaman khusus CETAK LPJ — buka lalu Ctrl+P → Save as PDF
export default async function CetakLPJPage() {
  const [s, st, transaksi, warga, K] = await Promise.all([
    getSettings(),
    getStats(),
    listTransaksi({}),
    listWarga(),
    getKonten(),
  ]);

  const masuk = transaksi.filter((t) => t.tipe === "masuk");
  const keluar = transaksi.filter((t) => t.tipe === "keluar");
  const lunas = warga.filter((w) => w.kupon?.status === "lunas");
  const belum = warga.filter((w) => w.kupon?.status !== "lunas");

  return (
    <main className="bg-white text-black min-h-screen p-3 sm:p-6 md:p-10 max-w-4xl mx-auto overflow-x-hidden print:p-6 print:overflow-visible print:max-w-none">
      {/* KOP LAPORAN */}
      <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
        <h1 className="text-base sm:text-xl md:text-2xl font-bold uppercase tracking-wide">
          {s.nama_masjid}
        </h1>
        <p className="text-sm mt-1">{s.penyelenggara || s.penyelenggara_singkat}</p>
        <h2 className="text-sm sm:text-lg font-bold mt-3 sm:mt-4 uppercase">
          Laporan Pertanggungjawaban
        </h2>
        <p className="text-sm">{s.nama_kegiatan} · {s.hijriah}</p>
        <p className="text-xs text-gray-600 mt-1">
          Disusun: {tanggalID(new Date())}
        </p>
      </div>

      {/* RINGKASAN */}
      <section className="mb-6">
        <h3 className="font-bold text-sm uppercase border-b border-black pb-1 mb-3">
          A. Ringkasan Keuangan
        </h3>
        <table className="w-full text-xs sm:text-sm border-collapse">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="py-1.5 sm:py-2 pr-2 sm:pr-4 font-medium break-all">Total Pemasukan</td>
              <td className="py-1.5 sm:py-2 text-right font-bold text-xs sm:text-sm break-all">{rupiah(st.dana_masuk)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="py-1.5 sm:py-2 pr-2 sm:pr-4 font-medium break-all">Total Pengeluaran</td>
              <td className="py-1.5 sm:py-2 text-right font-bold text-xs sm:text-sm break-all">{rupiah(st.dana_keluar)}</td>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="py-2 pr-4 font-bold">Sisa Kas</td>
              <td className="py-1.5 sm:py-2 text-right font-bold text-xs sm:text-sm break-all">{rupiah(st.sisa)}</td>
            </tr>
            <tr>
              <td className="py-1.5 sm:py-2 pr-2 sm:pr-4 font-medium break-all">Target Dana (Ancalah)</td>
              <td className="py-2 text-right">{rupiah(st.target_dana)}</td>
            </tr>
            <tr>
              <td className="py-1.5 sm:py-2 pr-2 sm:pr-4 font-medium break-all">Pencapaian</td>
              <td className="py-2 text-right">{st.persen}%</td>
            </tr>
            <tr>
              <td className="py-1.5 sm:py-2 pr-2 sm:pr-4 font-medium break-all">KK Lunas / Total</td>
              <td className="py-2 text-right">{st.kk_lunas} / {st.kk_total} KK</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* RENCANA ANGGARAN */}
      <TabelAnggaran
        judul={K["anggaran.judul"]}
        isi={K["anggaran.isi"]}
        catatan={K["anggaran.catatan"]}
        totalDanaTersedia={st.dana_masuk}
      />

      {/* RINCIAN PEMASUKAN */}
      <section className="mb-6">
        <h3 className="font-bold text-xs sm:text-sm uppercase border-b border-black pb-1 mb-3">
          B. Rincian Pemasukan ({masuk.length} transaksi)
        </h3>
        
        {/* Mobile: kartu */}
        <div className="sm:hidden print:hidden space-y-2">
          {masuk.map((t, i) => (
            <div key={t.id} className="border border-gray-300 rounded-lg p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gray-500">{i + 1}. {tanggalSingkat(t.tanggal)}</p>
                  <p className="text-xs font-medium leading-snug">{t.keterangan}</p>
                  <p className="text-[10px] text-gray-500">{t.kategori}</p>
                </div>
                <p className="text-xs font-bold shrink-0">{rupiah(t.jumlah)}</p>
              </div>
            </div>
          ))}
          <div className="border-t-2 border-black pt-2 flex justify-between">
            <span className="text-xs font-bold">TOTAL PEMASUKAN</span>
            <span className="text-xs font-bold">{rupiah(st.dana_masuk)}</span>
          </div>
        </div>

        {/* Desktop: tabel */}
        <table className="hidden sm:table print:table w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="py-1.5 px-2 text-left">No</th>
              <th className="py-1.5 px-2 text-left">Tanggal</th>
              <th className="py-1.5 px-2 text-left">Keterangan</th>
              <th className="py-1.5 px-2 text-left">Kategori</th>
              <th className="py-1.5 px-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {masuk.map((t, i) => (
              <tr key={t.id} className="border-b border-gray-200">
                <td className="py-1.5 px-2">{i + 1}</td>
                <td className="py-1.5 px-2">{tanggalSingkat(t.tanggal)}</td>
                <td className="py-1.5 px-2">{t.keterangan}</td>
                <td className="py-1.5 px-2">{t.kategori}</td>
                <td className="py-1.5 px-2 text-right">{rupiah(t.jumlah)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td colSpan={4} className="py-2 px-2 text-right">TOTAL PEMASUKAN</td>
              <td className="py-2 px-2 text-right">{rupiah(st.dana_masuk)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* RINCIAN PENGELUARAN */}
      <section className="mb-6">
        <h3 className="font-bold text-xs sm:text-sm uppercase border-b border-black pb-1 mb-3">
          C. Rincian Pengeluaran ({keluar.length} transaksi)
        </h3>
        
        {/* Mobile: kartu */}
        <div className="sm:hidden print:hidden space-y-2">
          {keluar.map((t, i) => (
            <div key={t.id} className="border border-gray-300 rounded-lg p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gray-500">{i + 1}. {tanggalSingkat(t.tanggal)}</p>
                  <p className="text-xs font-medium leading-snug">{t.keterangan}</p>
                  <p className="text-[10px] text-gray-500">{t.kategori} · bukti: {t.bukti_url ? "ada" : "-"}</p>
                </div>
                <p className="text-xs font-bold shrink-0">{rupiah(t.jumlah)}</p>
              </div>
            </div>
          ))}
          <div className="border-t-2 border-black pt-2 flex justify-between">
            <span className="text-xs font-bold">TOTAL PENGELUARAN</span>
            <span className="text-xs font-bold">{rupiah(st.dana_keluar)}</span>
          </div>
        </div>

        {/* Desktop: tabel */}
        <table className="hidden sm:table print:table w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="py-1.5 px-2 text-left">No</th>
              <th className="py-1.5 px-2 text-left">Tanggal</th>
              <th className="py-1.5 px-2 text-left">Keterangan</th>
              <th className="py-1.5 px-2 text-left">Kategori</th>
              <th className="py-1.5 px-2 text-left">Bukti</th>
              <th className="py-1.5 px-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {keluar.map((t, i) => (
              <tr key={t.id} className="border-b border-gray-200">
                <td className="py-1.5 px-2">{i + 1}</td>
                <td className="py-1.5 px-2">{tanggalSingkat(t.tanggal)}</td>
                <td className="py-1.5 px-2">{t.keterangan}</td>
                <td className="py-1.5 px-2">{t.kategori}</td>
                <td className="py-1.5 px-2 text-center">{t.bukti_url ? "Ada" : "-"}</td>
                <td className="py-1.5 px-2 text-right">{rupiah(t.jumlah)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td colSpan={5} className="py-2 px-2 text-right">TOTAL PENGELUARAN</td>
              <td className="py-2 px-2 text-right">{rupiah(st.dana_keluar)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* DAFTAR WARGA & STATUS */}
      <section className="mb-6">
        <h3 className="font-bold text-xs sm:text-sm uppercase border-b border-black pb-1 mb-3">
          D. Daftar Iuran Warga ({warga.length} KK)
        </h3>
        
        {/* Mobile: kartu */}
        <div className="sm:hidden space-y-1.5">
          {warga.map((w, i) => (
            <div key={w.id} className={`border rounded-lg p-2 flex items-center justify-between gap-2 ${w.kupon?.status === "lunas" ? "border-green-600 bg-green-50" : "border-gray-300"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug">{i + 1}. {w.nama}</p>
                <p className="text-[10px] text-gray-500">
                  {w.rt || "-"} · {w.kelas === "sponsor" ? "Sponsor" : `K${w.kelas}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold">{rupiah(w.ancalah)}</p>
                <p className={`text-[10px] font-bold ${w.kupon?.status === "lunas" ? "text-green-700" : "text-gray-400"}`}>
                  {w.kupon?.status === "lunas" ? "LUNAS" : "belum"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: tabel */}
        <table className="hidden sm:table print:table w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="py-1.5 px-2 text-left">No</th>
              <th className="py-1.5 px-2 text-left">Nama</th>
              <th className="py-1.5 px-2 text-left">RT</th>
              <th className="py-1.5 px-2 text-left">Kelas</th>
              <th className="py-1.5 px-2 text-right">Ancalah</th>
              <th className="py-1.5 px-2 text-center">Status</th>
              <th className="py-1.5 px-2 text-left">Tgl Bayar</th>
            </tr>
          </thead>
          <tbody>
            {warga.map((w, i) => (
              <tr key={w.id} className="border-b border-gray-200">
                <td className="py-1 px-2">{i + 1}</td>
                <td className="py-1 px-2">{w.nama}</td>
                <td className="py-1 px-2">{w.rt || "-"}</td>
                <td className="py-1 px-2">{w.kelas === "sponsor" ? "Sponsor" : `K${w.kelas}`}</td>
                <td className="py-1 px-2 text-right">{rupiah(w.ancalah)}</td>
                <td className="py-1 px-2 text-center">
                  {w.kupon?.status === "lunas" ? "LUNAS" : "belum"}
                </td>
                <td className="py-1 px-2">
                  {w.kupon?.tanggal_bayar ? tanggalSingkat(w.kupon.tanggal_bayar) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* PENGESAHAN */}
      <section className="mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
          <div>
            <p className="mb-12">Ketua Panitia</p>
            <div className="border-t border-black mx-8 pt-1 font-semibold">
              ..............................
            </div>
          </div>
          <div>
            <p className="mb-12">Bendahara</p>
            <div className="border-t border-black mx-8 pt-1 font-semibold">
              ..............................
            </div>
          </div>
          <div>
            <p className="mb-12">Mengetahui — Ketua DKM</p>
            <div className="border-t border-black mx-8 pt-1 font-semibold">
              ..............................
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <p className="text-center text-[10px] text-gray-500 mt-8 print:block hidden">
        Laporan ini dihasilkan otomatis oleh sistem LPJ Digital {s.nama_masjid} ·
        Dicetak: {new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Jakarta" })}
      </p>
    </main>
  );
}
