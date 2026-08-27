"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rupiah } from "@/lib/format";

const CONTOH_TEKS = `Nama; RT; Alamat; Nominal
Asep Saepudin; RT 01; Blok C No. 3; 50000
Euis Komariah; RT 02; Blok A No. 7; 100000
Dedi Mulyadi; RT 01; Blok B No. 12`;

const angka = (v) => Number(String(v || "").replace(/[^0-9]/g, "")) || 0;

// Parser fleksibel: "Nama; RT; Alamat; Nominal" per baris
// pemisah bisa ; atau tab (dari Excel). Kolom selain nama opsional.
function parseBaris(teks) {
  return String(teks || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      let parts = line.includes(";") || line.includes("\t")
        ? line.split(/[;\t]/).map((p) => p.trim())
        : line.split(",").map((p) => p.trim());
      if (parts.length === 1) parts = [parts[0], "", "", ""];
      const [nama, rt = "", alamat = "", nominal = ""] = parts;
      return { nama, rt, alamat, nominal: angka(nominal) };
    })
    .filter((r) => r.nama && !/^nama(\s+warga)?$/i.test(r.nama)); // buang header
}

export default function TambahWarga() {
  const router = useRouter();
  const [mode, setMode] = useState("satu"); // satu | banyak
  const [nama, setNama] = useState("");
  const [rt, setRt] = useState("");
  const [alamat, setAlamat] = useState("");
  const [nominal, setNominal] = useState("");
  const [teks, setTeks] = useState("");
  const [bawaan, setBawaan] = useState("");
  const [fileNama, setFileNama] = useState("");
  const [proses, setProses] = useState(false);
  const [gagal, setGagal] = useState("");
  const [hasil, setHasil] = useState(null);
  const fileRef = useRef(null);

  const ancalahDefault = angka(bawaan);
  const baris =
    mode === "satu"
      ? nama.trim()
        ? [{ nama, rt, alamat, nominal: angka(nominal) }]
        : []
      : parseBaris(teks);
  const siap = baris.filter((b) => b.nama.trim());

  async function kirim() {
    if (!siap.length) return;
    setProses(true);
    setGagal("");
    try {
      const rows = siap.map((b) => ({
        ...b,
        ancalah: b.nominal || ancalahDefault,
      }));
      const r = await fetch("/api/admin/warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Gagal menambah warga");
      setHasil(d);
      setNama(""); setRt(""); setAlamat(""); setNominal("");
      setTeks(""); setBawaan(""); setFileNama("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setGagal(e.message || "Gagal menambah warga");
    } finally {
      setProses(false);
    }
  }

  function bacaFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileNama(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      setMode("banyak");
      setTeks(String(reader.result || ""));
    };
    reader.readAsText(f);
  }

  const modeBtn = (id, label) => (
    <button
      key={id}
      onClick={() => { setMode(id); setHasil(null); setGagal(""); }}
      className={`pill border px-4 py-2 ${
        mode === id
          ? "bg-zamrud-600 text-white border-zamrud-600"
          : "bg-white text-zamrud-700 border-zamrud-200 hover:bg-zamrud-50"
      }`}
    >
      {label}
    </button>
  );

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none";

  return (
    <div className="kartu p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-judul text-xl font-bold text-zamrud-800">
          👥 Tambah Warga — Kupon Dibuat Otomatis
        </h3>
        <div className="flex gap-2">
          {modeBtn("satu", "Isi Manual")}
          {modeBtn("banyak", "Tempel / Unggah Daftar")}
        </div>
      </div>

      {hasil && (
        <div className="mt-4 rounded-xl border border-zamrud-200 bg-zamrud-50 p-4 text-sm">
          <p className="font-semibold text-zamrud-800">
            ✓ {hasil.ditambah} warga ditambah — kupon otomatis dibuat:
          </p>
          <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-zamrud-900/80">
            {hasil.kupon.slice(0, 8).map((k) => (
              <li key={k.kode} className="font-mono text-xs">
                {k.kode} · {k.nama} · {rupiah(k.ancalah)}
              </li>
            ))}
            {hasil.kupon.length > 8 && (
              <li className="text-xs text-zamrud-900/50">
                …dan {hasil.kupon.length - 8} lainnya
              </li>
            )}
          </ul>
          <Link
            href="/admin/kupon"
            className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang mt-3 text-xs px-3 py-2"
          >
            🖨️ Cetak Kupon Sekarang
          </Link>
        </div>
      )}

      {mode === "satu" ? (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <input className={inputCls} placeholder="Nama warga *" value={nama} onChange={(e) => setNama(e.target.value)} />
          <input className={inputCls} placeholder="RT (mis. RT 01)" value={rt} onChange={(e) => setRt(e.target.value)} />
          <input className={inputCls} placeholder="Alamat (mis. Blok C No. 3)" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          <input className={inputCls} placeholder="Ancalah (mis. 50000)" inputMode="numeric" value={nominal} onChange={(e) => setNominal(e.target.value)} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              className={inputCls + " flex-1 min-w-[200px]"}
              placeholder="Ancalah bawaan jika nominal kosong (mis. 50000)"
              inputMode="numeric"
              value={bawaan}
              onChange={(e) => setBawaan(e.target.value)}
            />
            <label className="tombol border-2 border-zamrud-600 text-zamrud-700 hover:bg-zamrud-50 text-xs px-3 py-2 cursor-pointer">
              📄 Unggah CSV/Excel (disimpan sebagai CSV)
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={bacaFile} />
            </label>
          </div>
          {fileNama && (
            <p className="text-xs text-zamrud-900/60">Berkas: {fileNama} — silakan periksa pratinjau di bawah.</p>
          )}
          <textarea
            className={inputCls + " font-mono text-sm"}
            rows={7}
            placeholder={"Satu warga per baris — pemisah titik koma (;) atau tab:\n\n" + CONTOH_TEKS}
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
          />
          <p className="text-xs text-zamrud-900/50">
            Format: <code>Nama; RT; Alamat; Nominal</code> — RT, alamat, dan nominal boleh dikosongkan.
            Bisa juga tempel langsung dari Excel/Google Sheets.
          </p>
        </div>
      )}

      {mode === "banyak" && siap.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-zamrud-100">
          <table className="w-full text-xs">
            <thead className="bg-zamrud-50 text-zamrud-800">
              <tr>
                <th className="text-left px-3 py-2">Nama</th>
                <th className="text-left px-3 py-2">RT</th>
                <th className="text-left px-3 py-2">Alamat</th>
                <th className="text-right px-3 py-2">Ancalah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zamrud-50">
              {siap.slice(0, 6).map((b, i) => (
                <tr key={i}>
                  <td className="px-3 py-1.5 font-medium">{b.nama}</td>
                  <td className="px-3 py-1.5">{b.rt || "-"}</td>
                  <td className="px-3 py-1.5">{b.alamat || "-"}</td>
                  <td className="px-3 py-1.5 text-right">
                    {rupiah(b.nominal || ancalahDefault)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {siap.length > 6 && (
            <p className="px-3 py-2 text-zamrud-900/50 text-xs">…dan {siap.length - 6} baris lainnya</p>
          )}
        </div>
      )}

      {gagal && <p className="text-sm text-rose-600 mt-3">{gagal}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={kirim}
          disabled={proses || !siap.length}
          className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50"
        >
          {proses
            ? "Memproses…"
            : `Tambah ${siap.length || ""} Warga & Buat Kupon`}
        </button>
        {siap.length > 0 && (
          <span className="text-xs text-zamrud-900/60">
            {siap.length} warga siap — tiap warga otomatis dapat kode kupon unik
          </span>
        )}
      </div>
    </div>
  );
}
