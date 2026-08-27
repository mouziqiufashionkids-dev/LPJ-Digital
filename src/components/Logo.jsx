"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Logo Masjid Al-Hikmah — digambar LANGSUNG di dalam kode (inline SVG):
// tidak memuat berkas eksternal sehingga selalu tampil di lingkungan apa pun.
// Bonus: klik 3x (dalam 1,6 detik) menuju panel panitia.
export default function Logo({ className = "h-9 w-9" }) {
  const router = useRouter();
  const klik = useRef([]);
  const [progres, setProgres] = useState(0);
  const [berpindah, setBerpindah] = useState(false);

  useEffect(() => {
    if (!progres) return;
    const t = setTimeout(() => {
      setProgres(0);
      klik.current = [];
    }, 1600);
    return () => clearTimeout(t);
  }, [progres]);

  function saatKlik() {
    if (berpindah) return;
    const now = Date.now();
    klik.current = klik.current.filter((t) => now - t < 1600);
    klik.current.push(now);
    const n = klik.current.length;
    if (n >= 3) {
      setBerpindah(true);
      router.push("/admin");
      return;
    }
    setProgres(n);
  }

  return (
    <button
      type="button"
      onClick={saatKlik}
      aria-label="Logo Masjid Al-Hikmah"
      className={`${className} relative inline-flex items-center justify-center rounded-full bg-white ring-2 ring-emas/60 p-[5%] shrink-0 transition active:scale-95`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        {/* badge */}
        <circle cx="100" cy="100" r="99" fill="#053827" />
        <circle cx="100" cy="100" r="92" fill="#0B6E4F" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
        {/* bulan sabit & bintang */}
        <path d="M100 21a9 9 0 1 0 0 18 7 7 0 1 1 0-18z" fill="#D4AF37" />
        <path d="M116 30l1.7 3.6 3.6 1.7-3.6 1.7-1.7 3.6-1.7-3.6-3.6-1.7 3.6-1.7z" fill="#D4AF37" />
        {/* masjid */}
        <g fill="#FAF7EF">
          <rect x="50" y="80" width="9" height="52" rx="2" />
          <path d="M54.5 62l7.5 16h-15z" />
          <circle cx="54.5" cy="59" r="2.5" />
          <rect x="141" y="80" width="9" height="52" rx="2" />
          <path d="M145.5 62l7.5 16h-15z" />
          <circle cx="145.5" cy="59" r="2.5" />
          <path d="M100 48C85 59 76 68 76 82h48c0-14-9-23-24-34z" />
          <rect x="76" y="82" width="48" height="6" />
          <rect x="62" y="88" width="76" height="44" rx="3" />
        </g>
        {/* pintu */}
        <path d="M100 100c-9 0-15 7-15 16v16h30v-16c0-9-6-16-15-16z" fill="#0B6E4F" />
        {/* jendela */}
        <path d="M72 106a5 5 0 0 1 10 0v9H72z" fill="#D4AF37" />
        <path d="M118 106a5 5 0 0 1 10 0v9h-10z" fill="#D4AF37" />
        {/* garis tanah */}
        <rect x="46" y="132" width="108" height="5" rx="2.5" fill="#D4AF37" />
      </svg>
      {progres > 0 && !berpindah && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: progres }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-emas" />
          ))}
        </span>
      )}
    </button>
  );
}
