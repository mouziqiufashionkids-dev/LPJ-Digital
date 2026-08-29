"use client";
import { useState } from "react";
import { fetchAdmin, segarkanPanel } from "@/lib/admin-auth";

export default function FormDokumentasi() {
  const [judul, setJudul] = useState("");
  const [berkas, setBerkas] = useState(null);
  const [pratinjau, setPratinjau] = useState(null);
  const [proses, setProses] = useState(false);
  const [gagal, setGagal] = useState("");

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none";

  function pilihBerkas(e) {
    const f = e.target.files?.[0];
    setBerkas(f || null);
    if (f) setPratinjau(URL.createObjectURL(f));
    else setPratinjau(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!berkas) return;
    setProses(true);
    setGagal("");
    try {
      const fd = new FormData();
      fd.set("judul", judul);
      fd.set("foto", berkas);
      const r = await fetchAdmin("/api/admin/dokumentasi", { method: "POST", body: fd });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Gagal mengunggah");
      setJudul(""); setBerkas(null); setPratinjau(null);
      segarkanPanel();
    } catch (err) {
      setGagal(err.message || "Gagal mengunggah");
    } finally {
      setProses(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="kartu p-5 md:p-6">
      <h3 className="font-judul text-xl font-bold text-zamrud-800">
        📷 Tambah Dokumentasi
      </h3>
      <p className="text-xs text-zamrud-900/60 mt-1">
        Foto kegiatan (maks 4 MB) — tampil di galeri beranda untuk warga.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">
            Judul / keterangan foto
          </label>
          <input
            placeholder="mis. Latihan marhaban anak-anak"
            value={judul}
            maxLength={100}
            onChange={(e) => setJudul(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zamrud-800 mb-1">
            Foto <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={pilihBerkas}
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zamrud-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zamrud-700 hover:file:bg-zamrud-100"
            />
            {pratinjau && (
              <img src={pratinjau} alt="Pratinjau" className="h-14 w-14 object-cover rounded-lg border border-zamrud-200" />
            )}
          </div>
          <p className="text-[10px] text-zamrud-900/40 mt-1">
            Langsung buka kamera HP — foto langsung tampil di galeri web untuk warga
          </p>
        </div>
      </div>
      {gagal && <p className="text-sm text-rose-600 mt-3">{gagal}</p>}
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={proses || !berkas}
          className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50 flex-1"
        >
          {proses ? "Mengunggah…" : "📸 Unggah ke Galeri LIVE"}
        </button>
      </div>
      {proses && (
        <div className="mt-2 h-2 bg-zamrud-100 rounded-full overflow-hidden">
          <div className="h-full bg-zamrud-600 animate-pulse w-full" />
        </div>
      )}
    </form>
  );
}
