"use client";
import { useState } from "react";
import { fetchAdmin, segarkanPanel } from "@/lib/admin-auth";

const KATEGORI = {
  keluar: ["Konsumsi", "Administrasi", "Peralatan", "Acara", "Dekorasi", "Santunan", "Lainnya"],
  masuk: ["Infak Sukarela", "Donasi", "Iuran Manual", "Lainnya"],
};

export default function FormTransaksi() {
  const hariIni = new Date().toISOString().slice(0, 10);
  const [tipe, setTipe] = useState("keluar");
  const [tanggal, setTanggal] = useState(hariIni);
  const [jumlah, setJumlah] = useState("");
  const [kategori, setKategori] = useState("Konsumsi");
  const [keterangan, setKeterangan] = useState("");
  const [berkas, setBerkas] = useState(null);
  const [pratinjau, setPratinjau] = useState(null);
  const [proses, setProses] = useState(false);
  const [sukses, setSukses] = useState("");
  const [hasilNotif, setHasilNotif] = useState(null);
  const [gagal, setGagal] = useState("");

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none";

  function gantiTipe(t) {
    setTipe(t);
    setKategori(KATEGORI[t][0]);
  }

  function pilihBerkas(e) {
    const f = e.target.files?.[0];
    setBerkas(f || null);
    if (f) setPratinjau(URL.createObjectURL(f));
    else setPratinjau(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const nilai = Number(String(jumlah).replace(/[^0-9]/g, ""));
    if (!nilai || !keterangan.trim()) return;
    setProses(true);
    setGagal("");
    setSukses("");
    try {
      const fd = new FormData();
      fd.set("tipe", tipe);
      fd.set("tanggal", tanggal);
      fd.set("jumlah", String(nilai));
      fd.set("kategori", kategori);
      fd.set("keterangan", keterangan);
      if (berkas) fd.set("bukti", berkas);
      const r = await fetchAdmin("/api/admin/transaksi", { method: "POST", body: fd });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Gagal menyimpan");
      setSukses(
        tipe === "keluar"
          ? "✓ Pengeluaran tercatat" + (d.buktiUrl ? " — nota tersimpan" : "")
          : "✓ Pemasukan tercatat"
      );
      setHasilNotif(d.notifWA === true);
      setJumlah(""); setKeterangan(""); setBerkas(null); setPratinjau(null);
      segarkanPanel();
    } catch (err) {
      setGagal(err.message || "Gagal menyimpan");
    } finally {
      setProses(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="kartu p-5 md:p-6">
      <h3 className="font-judul text-xl font-bold text-zamrud-800">
        💹 Catat Transaksi Kas
      </h3>
      <p className="text-xs text-zamrud-900/60 mt-1">
        Pemasukan infak/donasi & pengeluaran + foto nota — langsung tampil di
        laporan warga.
      </p>

      {/* pilih tipe */}
      <div className="flex gap-2 mt-4">
        {[
          ["keluar", "💸 Pengeluaran"],
          ["masuk", "💰 Pemasukan"],
        ].map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => gantiTipe(t)}
            className={`pill border px-4 py-2 ${
              tipe === t
                ? t === "keluar"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-zamrud-600 text-white border-zamrud-600"
                : "bg-white text-zamrud-700 border-zamrud-200 hover:bg-zamrud-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">Tanggal</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">
            Jumlah (Rp) <span className="text-rose-500">*</span>
          </label>
          <input
            inputMode="numeric"
            placeholder="mis. 50000"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">Kategori</label>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} className={inputCls}>
            {KATEGORI[tipe].map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">
            Keterangan <span className="text-rose-500">*</span>
          </label>
          <input
            placeholder={tipe === "keluar" ? "mis. Belanja konsumsi pengajian" : "mis. Infak — H. Rahmat"}
            value={keterangan}
            maxLength={160}
            onChange={(e) => setKeterangan(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* unggah bukti */}
      {tipe === "keluar" && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">
            Foto nota / bukti <span className="font-normal text-zamrud-900/50">(sangat disarankan, maks 4 MB)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={pilihBerkas}
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zamrud-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zamrud-700 hover:file:bg-zamrud-100"
            />
            {pratinjau && (
              <img src={pratinjau} alt="Pratinjau nota" className="h-14 w-12 object-cover rounded-lg border border-zamrud-200" />
            )}
          </div>
        </div>
      )}

      {sukses && <p className="text-sm text-zamrud-700 font-semibold mt-3">{sukses}</p>}
      {hasilNotif !== null && (
        <p className={`text-xs mt-1 ${hasilNotif ? "text-zamrud-600" : "text-amber-600"}`}>
          {hasilNotif
            ? "✅ Notifikasi WhatsApp terkirim ke bendahara"
            : "⚠ Notifikasi WA belum aktif (atur di ⚙ Pengaturan Web)"}
        </p>
      )}
      {gagal && <p className="text-sm text-rose-600 mt-3">{gagal}</p>}

      <button
        type="submit"
        disabled={proses}
        className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50 mt-4 w-full sm:w-auto"
      >
        {proses ? "Menyimpan…" : "Simpan Transaksi"}
      </button>
    </form>
  );
}
