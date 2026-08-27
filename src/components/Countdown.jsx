"use client";
import { useEffect, useState } from "react";

export default function Countdown({ target, label = "Menuju hari-H" }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return <div className="text-sm text-krem/60">Memuat hitungan…</div>;
  }
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) {
    return (
      <span className="text-sm text-emas-terang font-semibold">
        Alhamdulillah — kegiatan telah terlaksana 🤲
      </span>
    );
  }
  const hari = Math.floor(diff / 864e5);
  const jam = Math.floor((diff % 864e5) / 36e5);
  const menit = Math.floor((diff % 36e5) / 6e4);
  const detik = Math.floor((diff % 6e4) / 1e3);
  const kotak = (v, t) => (
    <div className="bg-krem/10 border border-krem/15 rounded-xl px-3 py-2 text-center min-w-[64px]">
      <div className="text-2xl font-bold text-krem tabular-nums">{String(v).padStart(2, "0")}</div>
      <div className="text-[10px] uppercase tracking-wide text-krem/60">{t}</div>
    </div>
  );
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-emas-terang">{label}</span>
      <div className="flex gap-2">
        {kotak(hari, "hari")}
        {kotak(jam, "jam")}
        {kotak(menit, "menit")}
        {kotak(detik, "detik")}
      </div>
    </div>
  );
}
