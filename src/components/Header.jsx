import Link from "next/link";
import Logo from "./Logo";
import { getSettings } from "@/lib/store";

export default async function Header() {
  const s = await getSettings();
  return (
    <header className="no-print sticky top-0 z-40 bg-zamrud-800/95 backdrop-blur text-krem shadow-kartu">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo className="h-9 w-9" />
          <span className="leading-tight">
            <span className="block font-judul font-bold tracking-wide text-base">
              {s.nama_masjid?.toUpperCase()}
            </span>
            <span className="block text-[11px] text-emas-terang">
              {s.nama_kegiatan} · Iuran & Laporan Terbuka
            </span>
          </span>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-krem/90">
          <Link href="/" className="hover:text-emas-terang">Beranda</Link>
          <Link href="/undangan" className="hover:text-emas-terang">Undangan</Link>
          <Link href="/cek-iuran" className="hover:text-emas-terang">Cek Iuran</Link>
          <Link href="/laporan" className="hover:text-emas-terang">Laporan</Link>
          <Link href="/kotak-saran" className="hover:text-emas-terang">Kotak Saran</Link>
        </nav>
      </div>
    </header>
  );
}
