"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ambilToken } from "@/lib/admin-auth";
import { rupiah } from "@/lib/format";
import TombolCetak from "@/components/TombolCetak";

const FILTER_KELAS = [
  { id: "semua", label: "Semua Kelas" },
  { id: "1", label: "Kelas 1 (150rb)" },
  { id: "2", label: "Kelas 2 (100rb)" },
  { id: "3", label: "Kelas 3 (75rb)" },
  { id: "sponsor", label: "Sponsor" },
];
const FILTER_STATUS = [
  { id: "belum", label: "Belum lunas" },
  { id: "semua", label: "Semua status" },
];

export default function KuponClient() {
  const [status, setStatus] = useState("belum");
  const [kelas, setKelas] = useState("semua");
  const [data, setData] = useState(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("status")) setStatus(p.get("status"));
    if (p.get("kelas")) setKelas(p.get("kelas"));
  }, []);

  const muat = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/admin/kupon?status=${status}&kelas=${kelas}`,
        { headers: { Authorization: `Bearer ${ambilToken() || ""}` }, credentials: "include" }
      );
      if (r.status === 401) {
        setGalat("Sesi berakhir — silakan login ulang lewat klik logo 3× lalu kembali ke sini.");
        setData(null);
        return;
      }
      const d = await r.json();
      setData(d);
      setGalat("");
    } catch {
      setGalat("Gagal memuat kupon.");
    }
  }, [status, kelas]);

  useEffect(() => {
    if (!ambilToken()) {
      setGalat("Sesi berakhir — silakan login ulang lewat klik logo 3× lalu kembali ke sini.");
      return;
    }
    muat();
  }, [muat]);

  function gantiFilter(param, nilai) {
    const p = new URLSearchParams(window.location.search);
    p.set(param, nilai);
    window.history.replaceState(null, "", `?${p.toString()}`);
    if (param === "status") setStatus(nilai);
    else setKelas(nilai);
  }

  const s = data?.pengaturan || {};
  const daftar = data?.daftar || [];

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
          {FILTER_KELAS.map((f) => (
            <button
              key={f.id}
              onClick={() => gantiFilter("kelas", f.id)}
              className={`pill border px-4 py-2 ${
                kelas === f.id
                  ? f.id === "sponsor"
                    ? "bg-emas text-zamrud-900 border-emas"
                    : "bg-zamrud-600 text-white border-zamrud-600"
                  : "bg-white text-zamrud-700 border-zamrud-200 hover:bg-zamrud-50"
              }`}
            >
              {f.id === "sponsor" ? "💛 " : ""}{f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {FILTER_STATUS.map((f) => (
            <button
              key={f.id}
              onClick={() => gantiFilter("status", f.id)}
              className={`pill border px-4 py-2 ${
                status === f.id
                  ? "bg-zamrud-800 text-white border-zamrud-800"
                  : "bg-white text-zamrud-700 border-zamrud-200 hover:bg-zamrud-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <strong>{daftar.length} kupon</strong> tampil · ± {Math.ceil(daftar.length / 10)} lembar
            A4 (10 kupon/lembar) · ukuran 92×54 mm.
          </p>
          {kelas === "sponsor" && (
            <p className="mt-1">
              💛 <strong>Kupon sponsor</strong> — desain emas, dicetak terpisah.
              Jangan lupa kirim <Link href="/proposal" className="underline font-semibold">proposal digital</Link> ke
              sponsor (tombol WA ada di panel utama).
            </p>
          )}
          <p className="mt-1">
            Tata cara: klik <strong>Cetak / Simpan PDF</strong> → potong garis putus-putus →
            bagikan ke juru tagih. QR di kupon menuju cek status iuran.
          </p>
        </div>
      </div>

      {galat && <p className="kartu p-6 text-center text-amber-700 mt-6">{galat}</p>}

      {/* kupon — ini yang tercetak */}
      <div className="wadah-kupon flex flex-wrap gap-4 mt-6">
        {daftar.map((w) => {
          const sponsor = w.kelas === "sponsor";
          return (
            <div
              key={w.id}
              className="kupon bg-white border-2 rounded-xl overflow-hidden flex shadow-kartu"
              style={{
                width: "92mm",
                height: "54mm",
                borderColor: sponsor ? "#D4AF37" : "#0B6E4F",
              }}
            >
              {/* bagian warga */}
              <div className="flex-1 p-2.5 flex flex-col min-w-0">
                <div
                  className={`text-white text-center rounded-md py-1 px-2 leading-tight ${
                    sponsor ? "bg-emas text-zamrud-900" : "bg-zamrud-800"
                  }`}
                >
                  <p className="text-[7.5px] uppercase tracking-widest">{s.nama_masjid}</p>
                  <p className="text-[9px] font-bold">
                    {sponsor ? "KUPON SPONSOR" : "KUPON IURAN"} · {s.nama_kegiatan}
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
                  {sponsor
                    ? `Terima kasih atas dukungan Anda · Kode: ${w.kode} · pindai QR untuk cek status`
                    : `Bayar ke juru tagih RT / bendahara · Kode: ${w.kode} · pindai QR untuk cek status iuran`}
                </p>
              </div>

              {/* potongan panitia */}
              <div
                className="w-[28mm] border-l-2 border-dashed p-1.5 flex flex-col items-center justify-center text-center gap-0.5 bg-krem/70"
                style={{ borderColor: sponsor ? "#D4AF37" : "#0B6E4F" }}
              >
                <p className="text-[6.5px] font-bold uppercase tracking-wide text-zamrud-800">
                  Potongan Panitia
                </p>
                <p className="text-[9px] font-semibold text-zamrud-900 leading-tight">
                  {w.nama}
                </p>
                <p className="text-[8px] text-zamrud-900/70">
                  {w.rt}{sponsor ? " · Sponsor" : ""}
                </p>
                <p className="text-[10.5px] font-bold text-zamrud-700">{rupiah(w.ancalah)}</p>
                {w.qr && (
                  <div className="qr-kecil w-[15mm] mt-0.5" dangerouslySetInnerHTML={{ __html: w.qr }} />
                )}
                <p className="text-[7.5px] font-mono font-bold text-zamrud-900/80">{w.kode}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!galat && data && daftar.length === 0 && (
        <p className="kartu p-6 text-center text-zamrud-900/60 mt-6">
          Tidak ada kupon pada filter ini.
        </p>
      )}
    </main>
  );
}
