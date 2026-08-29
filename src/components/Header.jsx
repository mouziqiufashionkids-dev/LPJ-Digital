import Link from "next/link";
import Logo from "./Logo";
import ToggleGelap from "./ToggleGelap";
import { getSettings } from "@/lib/store";

export default async function Header() {
  const s = await getSettings();
  return (
    <header className="no-print sticky top-0 z-40 bg-zamrud-800/95 backdrop-blur text-krem shadow-kartu">
      <div className="mx-auto max-w-5xl px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <Logo className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
          <ToggleGelap />
          <Link href="/" className="leading-tight min-w-0 flex-1">
            <span className="block font-judul font-bold tracking-wide text-sm sm:text-base truncate">
              {s.nama_masjid?.toUpperCase()}
            </span>
            <span className="block text-[10px] sm:text-[11px] text-emas-terang truncate">
              {s.nama_kegiatan} · Iuran & Laporan Terbuka
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-3 sm:gap-5 mt-2 sm:mt-1 overflow-x-auto text-xs sm:text-sm font-medium text-krem/90 whitespace-nowrap pb-0.5">
          <Link href="/" className="hover:text-emas-terang shrink-0">Beranda</Link>
          <Link href="/undangan" className="hover:text-emas-terang shrink-0">Undangan</Link>
          <Link href="/cek-iuran" className="hover:text-emas-terang shrink-0">Cek Iuran</Link>
          <Link href="/laporan" className="hover:text-emas-terang shrink-0">Laporan</Link>
          <Link href="/kotak-saran" className="hover:text-emas-terang shrink-0">Saran</Link>
        </nav>
      </div>
    </header>
  );
}
