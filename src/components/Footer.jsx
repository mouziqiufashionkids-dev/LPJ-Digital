import Link from "next/link";
import { getSettings, mode } from "@/lib/store";
import CopyLink from "./CopyLink";

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer className="mt-16 bg-zamrud-900 text-krem/80">
      <div className="bg-ornamen">
        <div className="mx-auto max-w-5xl px-4 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <p className="pill bg-emas/20 text-emas-terang mb-3">
              ✓ Laporan terverifikasi panitia
            </p>
            <p className="font-semibold text-krem">{s.nama_kegiatan}</p>
            <p className="text-sm mt-1">{s.penyelenggara}</p>
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
            <p>Dikelola oleh panitia — orang-orang yang Anda kenal.</p>
            <CopyLink />
          </div>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-krem">Transparansi</p>
            <p>Setiap rupiah dicatat terbuka dan bisa dicek warga kapan saja.</p>
            {mode === "demo" && (
              <p className="pill bg-krem/10 text-krem/70">⚙ Mode demo — data contoh</p>
            )}
            <Link href="/admin" className="block text-krem/50 hover:text-krem text-xs pt-2">
              Panel Panitia →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-krem/10 py-4 text-center text-xs text-krem/50">
        © 2026 {s.penyelenggara_singkat} · Dibangun untuk warga, lapor terbuka
      </div>
    </footer>
  );
}
