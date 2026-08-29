"use client";
import { useState } from "react";

// Kartu notifikasi yang muncul setelah transaksi — tombol langsung kirim ke grup WA
export default function NotifWAGrup({ tipe, jumlah, keterangan, kategori, stats, namaMasjid }) {
  const [tutup, setTutup] = useState(false);
  if (tutup) return null;

  const ikon = tipe === "masuk" ? "💰 PEMASUKAN BARU" : "💸 PENGELUARAN BARU";
  const jumlahStr = `Rp ${(jumlah || 0).toLocaleString("id-ID")}`;
  const garis = "━━━━━━━━━━━━━━━━━━";
  const base = typeof window !== "undefined" ? window.location.origin : "";

  const pesan = `${ikon}
${garis}
${keterangan || kategori || "-"}
${jumlahStr}

REKAP TERKINI:
Masuk: Rp ${(stats?.dana_masuk || 0).toLocaleString("id-ID")}
Keluar: Rp ${(stats?.dana_keluar || 0).toLocaleString("id-ID")}
Sisa: Rp ${(stats?.sisa || 0).toLocaleString("id-ID")}
Progress: ${stats?.persen || 0}% (target Rp ${(stats?.target_dana || 0).toLocaleString("id-ID")})
KK Lunas: ${stats?.kk_lunas || 0}/${stats?.kk_total || 0}

${garis}
Update realtime: ${base}
Panitia ${namaMasjid || "Masjid Al-Hikmah"}`;

  function kirimKeWA() {
    // wa.me tanpa nomor = buka pemilih chat WA (bisa pilih grup)
    window.location.href = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 kartu p-4 border-2 border-emas/60 bg-amber-50 shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{tipe === "masuk" ? "💰" : "💸"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-zamrud-800">
            {ikon}
          </p>
          <p className="text-xs text-zamrud-900/70 mt-0.5 truncate">
            {keterangan} — {jumlahStr}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={kirimKeWA}
              className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 text-xs px-4 py-2"
            >
              Kirim ke Grup WA
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(pesan);
                alert("Pesan rekap tersalin! Buka WA, pilih grup, tempel.");
              }}
              className="tombol border-2 border-zamrud-300 text-zamrud-700 text-xs px-3 py-2"
            >
              Salin
            </button>
            <button
              onClick={() => setTutup(true)}
              className="text-xs text-zamrud-900/40 hover:underline px-2"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
