import Link from "next/link";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { getSettings, listWarga } from "@/lib/store";
import { rupiah } from "@/lib/format";
import TombolCetak from "@/components/TombolCetak";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cetak Kupon — Panel Panitia",
};

const FILTER = [
  { id: "belum", label: "Belum lunas (siap dibagikan)" },
  { id: "semua", label: "Semua kupon" },
  { id: "lunas", label: "Sudah lunas" },
];

export default async function CetakKuponPage({ searchParams }) {
  const status = searchParams?.status || "belum";
  const [s, semua] = await Promise.all([getSettings(), listWarga()]);
  const daftar = semua.filter((w) =>
    status === "semua" ? true : w.kupon?.status === status
  );

  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const base = `${proto}://${host}`;

  const kupon = await Promise.all(
    daftar.map(async (w) => ({
      ...w,
      qr: w.kupon?.kode
        ? await QRCode.toString(`${base}/cek-iuran?kode=${w.kupon.kode}`, {
            type: "svg",
            margin: 0,
            width: 120,
            color: { dark: "#053827", light: "#ffffff" },
          })
        : null,
    }))
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* toolbar — tidak ikut tercetak */}
      <div className="no-print">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin" className="text-sm font-semibold text-zamrud-600 hover:underline">
            ← Panel
          </Link>
          <h1 className="font-judul text-2xl md:text-3xl font-bold text-zamrud-800">
            🖨️ Cetak Kupon Iuran
          </h1>
          <div className="ml-auto">
            <TombolCetak />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {FILTER.map((f) => (
            <Link
              key={f.id}
              href={f.id === "belum" ? "/admin/kupon" : `/admin/kupon?status=${f.id}`}
              className={`pill border px-4 py-2 ${
                status === f.id
                  ? "bg-zamrud-600 text-white border-zamrud-600"
                  : "bg-white text-zamrud-700 border-zamrud-200 hover:bg-zamrud-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <strong>{kupon.length} kupon</strong> · ± {Math.ceil(kupon.length / 10)} lembar A4
            (10 kupon/lembar) · ukuran kupon 92×54 mm.
          </p>
          <p className="mt-1">
            Tata cara: klik <strong>Cetak / Simpan PDF</strong> → potong mengikuti garis
            putus-putus → berikan ke juru tagih untuk dibagikan ke warga. Tiap kupon
            punya kode + QR: saat dipindai, warga langsung melihat status iurannya.
          </p>
        </div>
      </div>

      {/* kupon — ini yang tercetak */}
      <div className="wadah-kupon flex flex-wrap gap-4 mt-6">
        {kupon.map((w) => {
          const kode = w.kupon?.kode || "-";
          return (
            <div
              key={w.id}
              className="kupon bg-white border-2 border-zamrud-800 rounded-xl overflow-hidden flex shadow-kartu"
              style={{ width: "92mm", height: "54mm" }}
            >
              {/* bagian warga */}
              <div className="flex-1 p-2.5 flex flex-col min-w-0">
                <div className="bg-zamrud-800 text-white text-center rounded-md py-1 px-2 leading-tight">
                  <p className="text-[7.5px] uppercase tracking-widest">
                    {s.nama_masjid}
                  </p>
                  <p className="text-[9px] font-bold">
                    KUPON IURAN · {s.nama_kegiatan}
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-center py-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-zamrud-900 leading-snug truncate">
                    {w.nama}
                  </p>
                  <p className="text-[9px] text-zamrud-900/70">
                    {w.alamat || "-"} · {w.rt}
                  </p>
                  <p className="text-[17px] font-extrabold text-zamrud-700 mt-1 leading-none">
                    {rupiah(w.ancalah)}
                  </p>
                </div>
                <p className="text-[7px] text-zamrud-900/60 leading-snug">
                  Bayar ke juru tagih RT / bendahara · Kode: <b>{kode}</b> · pindai
                  QR untuk cek status iuran
                </p>
              </div>

              {/* potongan panitia */}
              <div className="w-[28mm] border-l-2 border-dashed border-zamrud-700 p-1.5 flex flex-col items-center justify-center text-center gap-0.5 bg-krem/70">
                <p className="text-[6.5px] font-bold uppercase tracking-wide text-zamrud-800">
                  Potongan Panitia
                </p>
                <p className="text-[9px] font-semibold text-zamrud-900 leading-tight">
                  {w.nama}
                </p>
                <p className="text-[8px] text-zamrud-900/70">{w.rt}</p>
                <p className="text-[10.5px] font-bold text-zamrud-700">
                  {rupiah(w.ancalah)}
                </p>
                {w.qr && (
                  <div className="qr-kecil w-[15mm] mt-0.5" dangerouslySetInnerHTML={{ __html: w.qr }} />
                )}
                <p className="text-[7.5px] font-mono font-bold text-zamrud-900/80">{kode}</p>
              </div>
            </div>
          );
        })}
      </div>

      {kupon.length === 0 && (
        <p className="kartu p-6 text-center text-zamrud-900/60 mt-6">
          Tidak ada kupon pada filter ini.{" "}
          {status === "belum" && "Semua kupon sudah lunas — masyaAllah! 🎉"}
        </p>
      )}
    </main>
  );
}
