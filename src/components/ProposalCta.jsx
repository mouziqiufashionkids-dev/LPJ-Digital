"use client";
import { useState } from "react";

// CTA proposal sponsor: bilah melekat di bawah layar + modal donasi.
// Tombol disesuaikan minat pembaca: donasi uang, bantuan barang, atau tanya dulu.
export default function ProposalCta({ pengaturan, untuk }) {
  const [buka, setBuka] = useState(false);
  const [minat, setMinat] = useState(null); // uang | barang | ragu

  if (!pengaturan) return null;
  const wa = pengaturan.kontak_wa || "62";
  const namaSapa = untuk ? ` (${untuk})` : "";

  const tautanWa = (pesan) =>
    `https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`;

  return (
    <>
      {/* pilihan sesuai minat */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => { setMinat("uang"); setBuka(true); }}
          className="kartu p-6 text-left border-2 border-emas/60 bg-amber-50/70 hover:shadow-lg transition"
        >
          <p className="text-3xl">💛</p>
          <p className="font-judul text-lg font-bold text-zamrud-800 mt-2">
            Saya ingin berdonasi dana
          </p>
          <p className="text-sm text-zamrud-900/70 mt-1">
            Transfer bank / tunai ke bendahara — bisa sekarang juga, kapan pun
            Anda siap.
          </p>
          <span className="pill bg-emas text-zamrud-900 mt-3">Donasi Sekarang →</span>
        </button>

        <a
          href={tautanWa(
            `Assalamu'alaikum${namaSapa}. Saya membaca proposal kegiatan Maulid Nabi ${pengaturan.nama_masjid} dan ingin membantu berupa BARANG (kebutuhan acara). Boleh info apa yang masih dibutuhkan?`
          )}
          target="_blank"
          rel="noreferrer"
          className="kartu p-6 text-left hover:shadow-lg transition"
        >
          <p className="text-3xl">📦</p>
          <p className="font-judul text-lg font-bold text-zamrud-800 mt-2">
            Saya ingin menyumbang barang
          </p>
          <p className="text-sm text-zamrud-900/70 mt-1">
            Konsumsi, hadiah, perlengkapan acara — koordinasikan langsung dengan
            panitia lewat WhatsApp.
          </p>
          <span className="pill bg-zamrud-100 text-zamrud-700 mt-3">Koordinasi via WA →</span>
        </a>

        <a
          href={tautanWa(
            `Assalamu'alaikum${namaSapa}. Saya masih ragu / ada pertanyaan seputar proposal kegiatan Maulid Nabi ${pengaturan.nama_masjid}. Boleh bertanya dulu?`
          )}
          target="_blank"
          rel="noreferrer"
          className="kartu p-6 text-left hover:shadow-lg transition"
        >
          <p className="text-3xl">💬</p>
          <p className="font-judul text-lg font-bold text-zamrud-800 mt-2">
            Masih ragu? Tanya dulu
          </p>
          <p className="text-sm text-zamrud-900/70 mt-1">
            Tidak apa-apa — hubungi panitia, kami jelaskan dengan senang hati.
            Tanpa paksaan, sedekah ikhlas yang terbaik.
          </p>
          <span className="pill bg-zamrud-100 text-zamrud-700 mt-3">Chat Panitia →</span>
        </a>
      </div>

      {/* bilah melekat (mobile-friendly) */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 bg-zamrud-800/95 backdrop-blur border-t border-emas/40 px-4 py-3 flex items-center gap-3 justify-center">
        <p className="text-xs md:text-sm text-krem/90 hidden sm:block">
          Dukung Maulid Nabi {pengaturan.nama_masjid} 💚
        </p>
        <button
          onClick={() => { setMinat("uang"); setBuka(true); }}
          className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang text-xs md:text-sm px-4 py-2.5"
        >
          💛 Donasi Sekarang
        </button>
        <a
          href={tautanWa(
            `Assalamu'alaikum${namaSapa}. Saya membaca proposal Maulid Nabi ${pengaturan.nama_masjid} dan ingin bertanya / membantu.`
          )}
          target="_blank"
          rel="noreferrer"
          className="tombol border-2 border-krem/40 text-krem hover:bg-krem/10 text-xs md:text-sm px-4 py-2.5"
        >
          💬 Hubungi Panitia
        </a>
      </div>

      {/* modal donasi */}
      {buka && (
        <div
          onClick={() => setBuka(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-zamrud-800 bg-ornamen text-krem px-6 py-4 text-center">
              <p className="font-judul text-xl font-bold">💛 Donasi Sekarang</p>
              <p className="text-xs text-krem/70 mt-0.5">
                Kegiatan Maulid Nabi {pengaturan.nama_masjid}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {pengaturan.rekening_no ? (
                <div className="rounded-xl border-2 border-dashed border-zamrud-300 bg-zamrud-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-zamrud-900/60 font-semibold">
                    Transfer {pengaturan.rekening_bank}
                  </p>
                  <p className="text-xl font-bold text-zamrud-800 tracking-wide mt-1 select-all">
                    {pengaturan.rekening_no}
                  </p>
                  <p className="text-sm text-zamrud-900/70">
                    a.n. {pengaturan.rekening_atas_nama}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zamrud-900/70 text-center">
                  Info rekening menyusul — sementara silakan hubungi panitia.
                </p>
              )}

              {pengaturan.qris_url && (
                <div className="text-center">
                  <img
                    src={pengaturan.qris_url}
                    alt="QRIS donasi"
                    className="mx-auto w-44 rounded-xl border border-zamrud-200"
                  />
                  <p className="text-xs text-zamrud-900/60 mt-1">
                    Scan QRIS — bisa dari semua e-wallet
                  </p>
                </div>
              )}

              <div className="text-sm text-zamrud-900/70 space-y-1.5">
                <p>✓ Tunai / kas juga bisa diserahkan ke bendahara panitia.</p>
                <p>✓ Nama Anda dicatat &amp; dilaporkan terbuka ke warga.</p>
              </div>

              <a
                href={tautanWa(
                  `Assalamu'alaikum${namaSapa}. Saya ingin berdonasi untuk kegiatan Maulid Nabi ${pengaturan.nama_masjid}. Mohon konfirmasi cara pembayarannya.`
                )}
                target="_blank"
                rel="noreferrer"
                className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 w-full"
              >
                💬 Konfirmasi Donasi via WhatsApp
              </a>
              <button
                onClick={() => setBuka(false)}
                className="w-full text-sm text-zamrud-900/60 hover:underline"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
