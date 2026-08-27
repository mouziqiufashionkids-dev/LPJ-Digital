import Link from "next/link";
import { getStats, listWarga, listTransaksi, listSaran } from "@/lib/store";
import { rupiah, tanggalSingkat } from "@/lib/format";
import AksiAdmin from "@/components/AksiAdmin";
import LiveRefresh from "@/components/LiveRefresh";
import TambahWarga from "@/components/TambahWarga";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel Panitia — LPJ Maulid Nabi",
};

export default async function AdminPage() {
  const [st, warga, transaksi, saran] = await Promise.all([
    getStats(),
    listWarga(),
    listTransaksi({}),
    listSaran({ hanyaTampil: false }),
  ]);
  const belumLunas = warga.filter((w) => w.kupon?.status !== "lunas").length;
  const saranBaru = saran.filter((s) => !s.tampil).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-judul text-3xl font-bold text-zamrud-800">
          🛠️ Panel Panitia
        </h1>
        <LiveRefresh intervalMs={20000} />
      </div>

      <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Panel tersembunyi.</strong> Halaman ini tidak ditautkan dari situs
        warga — akses hanya dengan mengetik alamat <code>/admin</code> langsung.
        Login &amp; proteksi kata sandi menyusul; catat pengeluaran + upload bukti
        foto juga menyusul.
      </div>

      {/* ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          ["Masuk", rupiah(st.dana_masuk), "text-zamrud-700"],
          ["Keluar", rupiah(st.dana_keluar), "text-rose-600"],
          ["Sisa", rupiah(st.sisa), "text-emas-gelap"],
          ["KK belum lunas", `${belumLunas} KK`, "text-amber-700"],
        ].map(([label, nilai, warna]) => (
          <div key={label} className="kartu p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zamrud-900/50">
              {label}
            </p>
            <p className={`text-lg font-bold ${warna}`}>{nilai}</p>
          </div>
        ))}
      </div>

      {/* tambah warga + generate kupon */}
      <div className="mt-8">
        <TambahWarga />
      </div>

      {/* warga & kupon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-10 mb-3">
        <h2 className="font-judul text-2xl font-bold text-zamrud-800">
          🎟️ Warga & Kupon Ancalah
        </h2>
        <Link
          href="/admin/kupon"
          className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang text-xs px-4 py-2.5"
        >
          🖨️ Cetak Kupon ({belumLunas} belum dibagikan)
        </Link>
      </div>
      <div className="kartu overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zamrud-900/60 border-b border-zamrud-100">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">RT</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Alamat</th>
              <th className="px-4 py-3 font-semibold">Ancalah</th>
              <th className="px-4 py-3 font-semibold">Kupon</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zamrud-50">
            {warga.map((w) => {
              const lunas = w.kupon?.status === "lunas";
              return (
                <tr key={w.id} className={lunas ? "bg-zamrud-50/40" : ""}>
                  <td className="px-4 py-2.5 font-medium text-zamrud-900">{w.nama}</td>
                  <td className="px-4 py-2.5 text-zamrud-900/60">{w.rt}</td>
                  <td className="px-4 py-2.5 text-zamrud-900/60 hidden md:table-cell">
                    {w.alamat || "-"}
                  </td>
                  <td className="px-4 py-2.5">{rupiah(w.ancalah)}</td>
                  <td className="px-4 py-2.5 text-zamrud-900/60 font-mono text-xs">
                    {w.kupon?.kode || "-"}
                  </td>
                  <td className="px-4 py-2.5">
                    {lunas ? (
                      <span className="pill bg-zamrud-100 text-zamrud-700">
                        ✓ Lunas {w.kupon.tanggal_bayar ? `· ${tanggalSingkat(w.kupon.tanggal_bayar)}` : ""}
                      </span>
                    ) : (
                      <span className="pill bg-amber-100 text-amber-700">Belum</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {!lunas && (
                        <AksiAdmin
                          url="/api/admin/bayar"
                          body={{ wargaId: w.id }}
                          label="Lunaskan"
                        />
                      )}
                      <AksiAdmin
                        url="/api/admin/warga"
                        method="DELETE"
                        body={{ id: w.id }}
                        label="Hapus"
                        merah
                        tanya={`Hapus ${w.nama}? Kupon & catatan iurannya juga akan dihapus.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* transaksi terbaru */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-10 mb-3">
        💹 Transaksi Terbaru
      </h2>
      <div className="kartu divide-y divide-zamrud-100">
        {transaksi.slice(0, 8).map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span>{t.tipe === "masuk" ? "💰" : "💸"}</span>
            <span className="flex-1 min-w-0">
              <span className="font-medium text-zamrud-900">{t.keterangan}</span>
              <span className="block text-xs text-zamrud-900/50">
                {tanggalSingkat(t.tanggal)} · {t.kategori}
              </span>
            </span>
            <span className={t.tipe === "masuk" ? "font-semibold text-zamrud-600" : "font-semibold text-rose-600"}>
              {rupiah(t.jumlah)}
            </span>
          </div>
        ))}
      </div>

      {/* kotak saran */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-10 mb-3">
        📮 Kotak Saran
        {saranBaru > 0 && (
          <span className="ml-2 pill bg-amber-100 text-amber-700 align-middle">
            {saranBaru} baru
          </span>
        )}
      </h2>
      <div className="space-y-3">
        {saran.map((s) => (
          <div key={s.id} className="kartu p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zamrud-900">
                {s.nama || "Warga Anonim"}
                {!s.tampil && (
                  <span className="ml-2 pill bg-amber-100 text-amber-700">
                    menunggu
                  </span>
                )}
                {s.ditindaklanjuti && (
                  <span className="ml-2 pill bg-zamrud-100 text-zamrud-700">
                    ✅ ditindaklanjuti
                  </span>
                )}
              </p>
              <p className="text-sm text-zamrud-900/80 mt-1">{s.pesan}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!s.tampil && (
                <AksiAdmin
                  url="/api/admin/saran"
                  body={{ id: s.id, tampil: true }}
                  label="Tampilkan"
                />
              )}
              {!s.ditindaklanjuti && (
                <AksiAdmin
                  url="/api/admin/saran"
                  body={{ id: s.id, ditindaklanjuti: true }}
                  label="Tandai Ditindaklanjuti"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
