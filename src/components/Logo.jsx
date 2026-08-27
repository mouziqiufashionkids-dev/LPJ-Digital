"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Logo masjid + pintu rahasia panitia: klik 3x (dalam 1,6 detik)
// untuk menuju halaman login admin.
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
      router.push("/admin/login");
      return;
    }
    setProgres(n);
  }

  return (
    <button
      type="button"
      onClick={saatKlik}
      aria-label="Logo Masjid Al-Hikmah"
      className={`${className} relative inline-flex items-center justify-center rounded-full bg-white ring-2 ring-emas/50 p-[8%] shrink-0 transition active:scale-95`}
    >
      <img
        src="/logo-masjid.png"
        alt="Logo Masjid Al-Hikmah"
        className="h-full w-full object-contain"
        draggable={false}
      />
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
