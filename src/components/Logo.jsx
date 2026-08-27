"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Logo Masjid Al-Hikmah — bulan sabit & bintang (desain awal),
// digambar LANGSUNG di dalam kode (inline SVG): selalu tampil,
// tajam di semua ukuran. Klik 3x (dalam 1,6 detik) menuju panel panitia.
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
      className={`${className} relative inline-flex items-center justify-center rounded-full bg-white ring-2 ring-emas/60 shrink-0 transition active:scale-95`}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill="#0B6E4F" />
        {/* bulan sabit */}
        <path d="M26 8a13 13 0 1 0 0 24 10.5 10.5 0 1 1 0-24z" fill="#E8CD6B" />
        {/* bintang kecil */}
        <path
          d="M29 12.5l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z"
          fill="#E8CD6B"
        />
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
