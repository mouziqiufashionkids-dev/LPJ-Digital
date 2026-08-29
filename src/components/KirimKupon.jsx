"use client";
import { useState } from "react";

// Tombol kirim kupon individual via WhatsApp
export default function KirimKupon({ kupon, pengaturan, tipeKupon = "iuron" }) {
  const [buka, setBuka] = useState(false);
  const [nomorWA, setNomorWA] = useState("");
  const [proposalan, setProposalan] = useState(true);

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const linkCek = `${base}/cek-iuran?kode=${kupon.kode}`;
  const linkProposal = `${base}/proposal?untuk=${encodeURIComponent(kupon.nama)}`;

  const nominal = (kupon.ancalah || kupon.nominal || 0).toLocaleString("id-ID");
  const namaMasjid = pengaturan?.nama_masjid || "Masjid Al-Hikmah";
  const namaKegiatan = pengaturan?.nama_kegiatan || "Maulid Nabi 1448 H";
  const label = tipeKupon === "sponsor" ? "SPONSOR" : "iuran";

  const pesan = proposalan
    ? `Assalamu'alaikum ${kupon.nama}.\n\nBerikut kupon ${label} Anda untuk kegiatan ${namaKegiatan} di ${namaMasjid}.\n\nKode kupon: ${kupon.kode}\nNominal: Rp ${nominal}\nLokasi: ${kupon.alamat || "-"} ${kupon.rt || ""}\n\nCek status iuran:\n${linkCek}\n\nProposal dukungan (silakan dibuka):\n${linkProposal}\n\nJazakumullah khairan atas dukungannya.\n\nPanitia ${namaMasjid}`
    : `Assalamu'alaikum ${kupon.nama}.\n\nBerikut kupon ${label} Anda:\n\nKode: ${kupon.kode}\nNominal: Rp ${nominal}\n\nCek status:\n${linkCek}\n\nJazakumullah khairan.\n\nPanitia ${namaMasjid}`;

  function kirim() {
    const nomor = nomorWA.replace(/[^0-9]/g, "");
    if (!nomor) {
      alert("Isi nomor WhatsApp dulu (misal: 62812345678)");
      return;
    }
    // Pakai location.href — di HP langsung buka aplikasi WA
    // (window.open sering diblokir popup blocker / buka tab lalu tutup)
    const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
    setBuka(false);
    window.location.href = url;
  }

  return (
    <>
      <button
        onClick={() => setBuka(true)}
        className="text-xs font-semibold bg-zamrud-600 text-white rounded-lg px-2.5 py-1.5 hover:bg-zamrud-700"
        title="Kirim kupon via WhatsApp"
      >
        WA
      </button>

      {buka && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setBuka(false)}
        >
          <div
            className="kartu p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-judul text-lg font-bold text-zamrud-800">
              Kirim Kupon ke {kupon.nama}
            </h3>
            <p className="text-xs text-zamrud-900/60 mt-1">
              Kupon: {kupon.kode} · Rp {nominal}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zamrud-800 mb-1">
                Nomor WhatsApp (format 62...)
              </label>
              <input
                inputMode="numeric"
                placeholder="mis. 62812345678"
                value={nomorWA}
                onChange={(e) => setNomorWA(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none text-sm"
              />
            </div>

            <label className="flex items-center gap-2 mt-3 text-sm text-zamrud-800 cursor-pointer">
              <input
                type="checkbox"
                checked={proposalan}
                onChange={(e) => setProposalan(e.target.checked)}
                className="h-5 w-5 accent-zamrud-600"
              />
              Sertakan link proposal donasi
            </label>

            <div className="mt-3 p-3 bg-zamrud-50 rounded-xl text-xs text-zamrud-900/70 max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{pesan}</pre>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <a
                href={`https://wa.me/${nomorWA.replace(/[^0-9]/g, "") || "X"}?text=${encodeURIComponent(pesan)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  const nomor = nomorWA.replace(/[^0-9]/g, "");
                  if (!nomor) {
                    e.preventDefault();
                    alert("Isi nomor WhatsApp dulu (misal: 62812345678)");
                    return;
                  }
                  setBuka(false);
                }}
                className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 text-center text-sm"
                style={{ textDecoration: "none" }}
              >
                Kirim via WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pesan).then(() => {
                    alert("Pesan tersalin! Buka WA, pilih kontak, tempel pesan.");
                  }).catch(() => {
                    // fallback: tampilkan pesan untuk salin manual
                  });
                }}
                className="tombol border-2 border-zamrud-300 text-zamrud-700 text-sm"
              >
                Salin Pesan (Tempel Manual)
              </button>
            </div>
            <p className="text-[10px] text-zamrud-900/40 text-center mt-2 leading-snug">
              Tombol "Kirim via WhatsApp" akan membuka aplikasi WA di HP Anda.
              Jika tidak terbuka otomatis, gunakan "Salin Pesan" lalu tempel di WA.
            </p>
            <button
              onClick={() => setBuka(false)}
              className="w-full text-xs text-zamrud-900/50 hover:underline mt-3"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
