"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { fetchAdmin, segarkanPanel } from "@/lib/admin-auth";
import { rupiah } from "@/lib/format";

// ============================================================
// Tambah warga masal: manual / tempel daftar / unggah CSV/Excel.
// Kolom: Nama; RT; Alamat; Nominal; Kelas  (semua kecuali nama opsional)
// ============================================================

const KELAS_PRESET = { "1": 150000, "2": 100000, "3": 75000 };

const KELAS_LABEL = {
  "1": "Kelas 1 · Rp 150.000",
  "2": "Kelas 2 · Rp 100.000",
  "3": "Kelas 3 · Rp 75.000",
  sponsor: "Sponsor · nominal bebas",
};

const CONTOH_TEKS = `Nama; RT; Alamat; Nominal; Kelas
Asep Saepudin; RT 01; Blok C No. 3; ; 1
Euis Komariah; RT 02; Blok A No. 7; ; 2
Toko Barokah (sponsor); RT 03; Jl. Raya No. 10; 500000; sponsor`;

const angka = (v) => Number(String(v || "").replace(/[^0-9]/g, "")) || 0;

function normalKelas(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "";
  if (s.includes("sponsor") || s === "sp" || s === "s") return "sponsor";
  const m = s.match(/\d/);
  if (m && ["1", "2", "3"].includes(m[0])) return m[0];
  return "";
}

// parser teks: pemisah ; atau tab, kolom ke-5 = kelas
function parseBaris(teks) {
  return String(teks || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      let p = line.includes(";") || line.includes("\t")
        ? line.split(/[;\t]/).map((x) => x.trim())
        : line.split(",").map((x) => x.trim());
      if (p.length === 1) p = [p[0], "", "", "", ""];
      const [nama, rt = "", alamat = "", nominal = "", kelas = ""] = p;
      return {
        nama, rt, alamat,
        nominal: angka(nominal),
        kelas: normalKelas(kelas),
      };
    })
    .filter((r) => r.nama && !/^nama(\s+warga)?$/.test(r.nama.toLowerCase()));
}

// parser Excel/CSV (SheetJS) — kolom dikenali dari judul kolomnya
async function parseExcel(berkas) {
  const XLSX = await import("xlsx");
  const buf = await berkas.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const baris = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })
    .map((r) => r.map((c) => String(c ?? "").trim()))
    .filter((r) => r.some((c) => c));
  if (!baris.length) return [];

  // baris pertama header?
  const kepala = baris[0].map((c) => c.toLowerCase());
  const adaHeader = kepala.some((c) => c.includes("nama"));
  const idx = { nama: 0, rt: 1, alamat: 2, nominal: 3, kelas: 4 };
  if (adaHeader) {
    const cari = (kata) => kepala.findIndex((c) => kata.some((k) => c.includes(k)));
    idx.nama = cari(["nama"]);
    idx.rt = cari(["rt"]);
    idx.alamat = cari(["alamat"]);
    idx.nominal = cari(["nominal", "ancalah", "iuran", "donasi", "jumlah"]);
    idx.kelas = cari(["kelas"]);
    if (idx.nama === -1) throw new Error("Kolom 'Nama' tidak ditemukan di berkas");
  }
  const mulai = adaHeader ? 1 : 0;
  return baris.slice(mulai)
    .map((r) => ({
      nama: r[idx.nama] || "",
      rt: idx.rt >= 0 ? r[idx.rt] || "" : "",
      alamat: idx.alamat >= 0 ? r[idx.alamat] || "" : "",
      nominal: idx.nominal >= 0 ? angka(r[idx.nominal]) : 0,
      kelas: idx.kelas >= 0 ? normalKelas(r[idx.kelas]) : "",
    }))
    .filter((r) => r.nama && !/^nama/.test(r.nama.toLowerCase()));
}

export default function TambahWarga({ namaSudahAda }) {
  // namaSudahAda: Set nama (sudah dinormalisasi) yang telah terdaftar —
  // dipakai menandai & mencegah upload dobel sebelum mengirim ke server.
  const [mode, setMode] = useState("satu"); // satu | banyak
  const [nama, setNama] = useState("");
  const [rt, setRt] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kelas, setKelas] = useState("1");
  const [nominal, setNominal] = useState("");
  const [teks, setTeks] = useState("");
  const [kelasBawaan, setKelasBawaan] = useState("1");
  const [fileNama, setFileNama] = useState("");
  const [proses, setProses] = useState(false);
  const [gagal, setGagal] = useState("");
  const [hasil, setHasil] = useState(null);
  const fileRef = useRef(null);

  const baris =
    mode === "satu"
      ? nama.trim()
        ? [{ nama, rt, alamat, nominal: angka(nominal), kelas }]
        : []
      : parseBaris(teks);
  const siap = baris.filter((b) => b.nama.trim());
  const sudahAda = (n) =>
    namaSudahAda instanceof Set &&
    namaSudahAda.has(String(n || "").toLowerCase().replace(/\s+/g, " ").trim());
  const siapBener = siap.filter((b) => !sudahAda(b.nama));

  function isiNominalDariKelas(k) {
    setKelas(k);
    setNominal(KELAS_PRESET[k] ? String(KELAS_PRESET[k]) : "");
  }

  async function bacaFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileNama(f.name);
    setGagal("");
    try {
      if (/\.(xlsx|xls)$/i.test(f.name)) {
        const hasil = await parseExcel(f);
        setMode("banyak");
        setTeks(
          hasil.map((r) => [r.nama, r.rt, r.alamat, r.nominal || "", r.kelas].join("; ")).join("\n")
        );
      } else {
        setMode("banyak");
        const teksIsi = await f.text();
        setTeks(teksIsi);
      }
    } catch (err) {
      setGagal(`Gagal membaca berkas: ${err.message}`);
    }
  }

  async function kirim() {
    if (!siapBener.length) return;
    setProses(true);
    setGagal("");
    try {
      const rows = siapBener.map((b) => {
        const k = b.kelas || (mode === "satu" ? kelas : kelasBawaan);
        return {
          ...b,
          kelas: k || "3",
          ancalah: b.nominal || (KELAS_PRESET[k] ?? angka(nominal)) || 0,
        };
      });
      const r = await fetchAdmin("/api/admin/warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Gagal menambah warga");
      setHasil(d);
      setNama(""); setRt(""); setAlamat(""); setNominal(""); setKelas("1");
      setTeks(""); setFileNama("");
      if (fileRef.current) fileRef.current.value = "";
      segarkanPanel();
    } catch (e) {
      setGagal(e.message || "Gagal menambah warga");
    } finally {
      setProses(false);
    }
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none";

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

  return (
    <div className="kartu p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-judul text-xl font-bold text-zamrud-800">
          👥 Tambah Warga — Kupon Dibuat Otomatis
        </h3>
        <div className="flex gap-2">
          {modeBtn("satu", "Isi Manual")}
          {modeBtn("banyak", "Tempel / Unggah Excel")}
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
          {hasil.dobel?.length > 0 && (
            <p className="text-amber-700 mt-2 text-xs">
              ⚠ {hasil.dobel.length} nama <strong>dilewati karena sudah terdaftar</strong>:{` `}
              {hasil.dobel.slice(0, 5).join(", ")}
              {hasil.dobel.length > 5 && ` …(+${hasil.dobel.length - 5})`}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Link href="/admin/kupon" className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang text-xs px-3 py-2">
              🖨️ Cetak Kupon Sekarang
            </Link>
            <Link href="/admin/kupon?kelas=sponsor" className="tombol border-2 border-emas text-emas-gelap hover:bg-amber-50 text-xs px-3 py-2">
              🖨️ Cetak Kupon Sponsor
            </Link>
          </div>
        </div>
      )}

      {mode === "satu" ? (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <input className={inputCls} placeholder="Nama warga *" value={nama} onChange={(e) => setNama(e.target.value)} />
          <input className={inputCls} placeholder="RT (mis. RT 01)" value={rt} onChange={(e) => setRt(e.target.value)} />
          <input className={inputCls} placeholder="Alamat (mis. Blok C No. 3)" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          <div>
            <select className={inputCls} value={kelas} onChange={(e) => isiNominalDariKelas(e.target.value)}>
              {Object.entries(KELAS_LABEL).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <input
            className={inputCls}
            placeholder={kelas === "sponsor" ? "Nominal sponsor (mis. 500000) *" : "Nominal (otomatis dari kelas)"}
            inputMode="numeric"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className={inputCls + " flex-1 min-w-[200px]"}
              value={kelasBawaan}
              onChange={(e) => setKelasBawaan(e.target.value)}
            >
              <option value="1">Kelas bawaan: Kelas 1 (Rp 150.000)</option>
              <option value="2">Kelas bawaan: Kelas 2 (Rp 100.000)</option>
              <option value="3">Kelas bawaan: Kelas 3 (Rp 75.000)</option>
              <option value="sponsor">Kelas bawaan: Sponsor</option>
            </select>
            <label className="tombol border-2 border-zamrud-600 text-zamrud-700 hover:bg-zamrud-50 text-xs px-3 py-2 cursor-pointer">
              📊 Unggah Excel / CSV
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={bacaFile} />
            </label>
          </div>
          {fileNama && (
            <p className="text-xs text-zamrud-900/60">
              Berkas: <b>{fileNama}</b> — dikenali kolomnya otomatis, periksa pratinjau di bawah lalu klik tambah.
            </p>
          )}
          <textarea
            className={inputCls + " font-mono text-sm"}
            rows={8}
            placeholder={"Satu warga per baris — pemisah titik koma (;):\n\n" + CONTOH_TEKS}
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
          />
          <p className="text-xs text-zamrud-900/50">
            Format: <code>Nama; RT; Alamat; Nominal; Kelas</code> — kecuali nama,
            semua boleh dikosongkan (nominal &amp; kelas mengikuti pilihan bawaan;
            kelas: 1 / 2 / 3 / sponsor). Bisa juga tempel langsung dari Excel.
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
                <th className="text-left px-3 py-2">Kelas</th>
                <th className="text-right px-3 py-2">Ancalah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zamrud-50">
              {siap.slice(0, 6).map((b, i) => {
                const k = b.kelas || kelasBawaan;
                const dobel = sudahAda(b.nama);
                return (
                  <tr key={i} className={dobel ? "bg-amber-50/70" : ""}>
                    <td className="px-3 py-1.5 font-medium">
                      {b.nama}{" "}
                      {dobel && (
                        <span className="pill bg-amber-100 text-amber-700 ml-1">sudah ada — dilewati</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">{b.rt || "-"}</td>
                    <td className="px-3 py-1.5">{b.alamat || "-"}</td>
                    <td className="px-3 py-1.5">{k === "sponsor" ? "Sponsor" : `Kelas ${k}`}</td>
                    <td className="px-3 py-1.5 text-right">
                      {rupiah(b.nominal || KELAS_PRESET[k] || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {siap.length > 6 && (
            <p className="px-3 py-2 text-zamrud-900/50 text-xs">…dan {siap.length - 6} baris lainnya</p>
          )}
          {siap.length !== siapBener.length && (
            <p className="px-3 py-2 text-amber-700 text-xs border-t border-amber-100">
              ⚠ {siap.length - siapBener.length} nama sudah terdaftar — otomatis dilewati saat ditambahkan.
            </p>
          )}
        </div>
      )}

      {gagal && <p className="text-sm text-rose-600 mt-3">{gagal}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={kirim}
          disabled={proses || !siapBener.length}
          className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50"
        >
          {proses ? "Memproses…" : `Tambah ${siapBener.length || ""} Warga & Buat Kupon`}
        </button>
        {siapBener.length > 0 && (
          <span className="text-xs text-zamrud-900/60">
            {siapBener.length} warga siap — tiap warga otomatis dapat kode kupon unik
          </span>
        )}
        {siap.length > 0 && siapBener.length === 0 && (
          <span className="text-xs text-amber-700">
            Semua nama sudah terdaftar — tidak ada yang perlu ditambahkan.
          </span>
        )}
      </div>
    </div>
  );
}
