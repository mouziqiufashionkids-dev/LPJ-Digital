"use client";
import { useEffect, useRef, useState } from "react";
import { rupiah, tanggalID } from "@/lib/format";

export default function SearchIuran({ namaKegiatan = "Maulid Nabi ﷺ", namaMasjid = "Masjid" }) {
  const [q, setQ] = useState("");
  const [hasil, setHasil] = useState([]);
  const [memuat, setMemuat] = useState(false);
  const [pilih, setPilih] = useState(null);
  const timer = useRef(null);

  // dukung tautan dari QR kupon: /cek-iuran?kode=MLD-0001
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const awal = p.get("kode") || p.get("q");
    if (awal) setQ(awal);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHasil([]);
      setPilih(null);
      setMemuat(false);
      return;
    }
    setMemuat(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/warga?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setHasil(d.hasil || []);
      } catch {
        setHasil([]);
      } finally {
        setMemuat(false);
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div>
      {/* kolom cari */}
      <label htmlFor="cari" className="block text-sm font-semibold text-zamrud-800 mb-2">
        Ketik nama Anda (atau nama kepala keluarga)
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        <input
          id="cari"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Contoh: Asep atau kode kupon MLD-0001"
          className="w-full text-lg pl-12 pr-4 py-4 rounded-2xl border-2 border-zamrud-200 bg-white focus:border-zamrud-600 focus:outline-none"
        />
      </div>

      {memuat && <p className="text-sm text-zamrud-600 mt-3">Mencari…</p>}

      {/* hasil pencarian */}
      {hasil.length > 0 && !pilih && (
        <ul className="mt-4 divide-y divide-zamrud-100 kartu overflow-hidden">
          {hasil.map((w) => (
            <li key={w.id}>
              <button
                onClick={() => setPilih(w)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-zamrud-50 text-left"
              >
                <span>
                  <span className="font-semibold text-zamrud-900">{w.nama}</span>
                  <span className="text-sm text-zamrud-900/50"> · {w.rt}</span>
                  <span className="block text-xs text-zamrud-900/50">
                    Ancalah {rupiah(w.nominal)}
                  </span>
                </span>
                {w.status === "lunas" ? (
                  <span className="pill bg-zamrud-100 text-zamrud-700">✓ Lunas</span>
                ) : (
                  <span className="pill bg-amber-100 text-amber-700">Belum bayar</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {q.trim().length >= 2 && !memuat && hasil.length === 0 && !pilih && (
        <p className="mt-4 kartu p-4 text-sm text-zamrud-900/70">
          Nama tidak ditemukan. Coba kata lain (misalnya nama depan saja), atau
          hubungi panitia lewat WhatsApp di bagian bawah halaman ini.
        </p>
      )}

      {/* kwitansi / status terpilih */}
      {pilih && (
        <div className="mt-6">
          <div className="max-w-sm mx-auto bg-white border-2 border-emas rounded-2xl overflow-hidden shadow-kartu">
            <div className="bg-zamrud-800 bg-ornamen text-krem px-4 py-3 text-center">
              <p className="text-[11px] tracking-widest text-emas-terang">KWITANSI IURAN</p>
              <p className="font-judul font-bold">{namaKegiatan}</p>
              <p className="text-[10px] text-krem/60">{namaMasjid}</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-sm text-zamrud-900/60">{pilih.rt}</p>
              <p className="text-lg font-bold text-zamrud-900">{pilih.nama}</p>
              <p className="text-3xl font-bold text-zamrud-800 my-3">{rupiah(pilih.nominal)}</p>

              {pilih.status === "lunas" ? (
                <>
                  <span className="pill bg-zamrud-100 text-zamrud-700 text-sm px-4 py-1.5">
                    ✓ SUDAH DITERIMA PANITIA
                  </span>
                  <p className="text-xs text-zamrud-900/60 mt-3">
                    Diterima {tanggalID(pilih.tanggal_bayar)} · Kupon {pilih.kode}
                  </p>
                  <p className="text-xs text-zamrud-900/50 mt-1">
                    Simpan tangkapan layar ini sebagai bukti iuran Anda 📱
                  </p>
                </>
              ) : (
                <>
                  <span className="pill bg-amber-100 text-amber-700 text-sm px-4 py-1.5">
                    BELUM DITERIMA PANITIA
                  </span>
                  <p className="text-xs text-zamrud-900/60 mt-3">
                    Silakan serahkan iuran ke juru tagih RT atau langsung ke
                    bendahara panitia. Kupon {pilih.kode}
                  </p>
                </>
              )}
            </div>
            <div className="border-t border-dashed border-zamrud-200 px-5 py-2 text-center text-[10px] text-zamrud-900/40">
              Diterbitkan otomatis oleh sistem LPJ panitia
            </div>
          </div>

          <button
            onClick={() => setPilih(null)}
            className="block mx-auto mt-4 text-sm font-semibold text-zamrud-700 hover:underline"
          >
            ← Cari nama lain
          </button>
        </div>
      )}
    </div>
  );
}
