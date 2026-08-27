"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AksiAdmin({ url, body, label, suksesLabel = "✓ Berhasil" }) {
  const router = useRouter();
  const [proses, setProses] = useState(false);
  const [selesai, setSelesai] = useState(false);

  async function jalankan() {
    setProses(true);
    try {
      await fetch(url, {
        method: "POST",
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
      className="text-xs font-semibold bg-zamrud-600 text-white rounded-lg px-3 py-1.5 hover:bg-zamrud-700 disabled:opacity-50"
    >
      {proses ? "…" : label}
    </button>
  );
}
