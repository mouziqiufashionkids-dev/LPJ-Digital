"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Penanda "live": otomatis menyegarkan data halaman tiap interval.
export default function LiveRefresh({ intervalMs = 15000 }) {
  const router = useRouter();
  const [hidup, setHidup] = useState(false);

  useEffect(() => {
    setHidup(true);
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  if (!hidup) return null;
  return (
    <span className="pill bg-zamrud-50 text-zamrud-700 border border-zamrud-100">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zamrud-600 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-zamrud-600" />
      </span>
      Live — diperbarui otomatis
    </span>
  );
}
