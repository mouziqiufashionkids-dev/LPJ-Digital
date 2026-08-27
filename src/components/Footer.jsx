import Link from "next/link";
import { getSettings, getKonten, mode } from "@/lib/store";
import { isi } from "@/lib/konten";
import CopyLink from "./CopyLink";

export default async function Footer() {
  const [s, K] = await Promise.all([getSettings(), getKonten()]);
  return (
    <footer className="no-print mt-16 bg-zamrud-900 text-krem/80">
      <div className="bg-ornamen">
        <div className="mx-auto max-w-5xl px-4 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <p className="pill bg-emas/20 text-emas-terang mb-3">
              ✓ Laporan terverifikasi panitia
            </p>
            <p className="font-semibold text-krem">{s.nama_masjid}</p>
            <p className="text-sm mt-1">{s.nama_kegiatan} · {s.penyelenggara_singkat}</p>
            <p className="text-sm">{s.lokasi_acara}</p>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-krem">Ada pertanyaan?</p>
            <p>
              Chat langsung bendahara:{" "}
              <a
                href={`https://wa.me/${s.kontak_wa}`}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-emas text-emas-terang"
              >
                WhatsApp Panitia
              </a>
            </p>
            <p>{isi(K["footer.tagline"], s)}</p>
            <CopyLink />
          </div>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-krem">Transparansi</p>
            <p>{isi(K["footer.transparansi"], s)}</p>
            {mode === "demo" && (
              <p className="pill bg-krem/10 text-krem/70">⚙ Mode demo — data contoh</p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-krem/10 py-4 text-center text-xs text-krem/50">
        © 2026 {s.nama_masjid} · Dibangun untuk warga, lapor terbuka
      </div>
    </footer>
  );
}
