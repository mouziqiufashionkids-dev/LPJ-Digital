"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AksiAdmin({
  url,
  body,
  label,
  suksesLabel = "✓ Berhasil",
  method = "POST",
  tanya = null,
  merah = false,
}) {
  const router = useRouter();
  const [proses, setProses] = useState(false);
  const [selesai, setSelesai] = useState(false);

  async function jalankan() {
    if (tanya && !window.confirm(tanya)) return;
    setProses(true);
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSelesai(true);
      router.refresh();
    } finally {
      setProses(false);
    }
  }

  if (selesai) {
    return <span className="text-xs font-semibold text-zamrud-600">{suksesLabel}</span>;
  }
  return (
    <button
      onClick={jalankan}
      disabled={proses}
      className={`text-xs font-semibold rounded-lg px-3 py-1.5 disabled:opacity-50 ${
        merah
          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
          : "bg-zamrud-600 text-white hover:bg-zamrud-700"
      }`}
    >
      {proses ? "…" : label}
    </button>
  );
}
