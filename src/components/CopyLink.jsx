"use client";
import { useState } from "react";

export default function CopyLink() {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setOk(true);
          setTimeout(() => setOk(false), 2000);
        } catch {}
      }}
      className="inline-flex items-center gap-2 text-xs font-semibold bg-krem/10 hover:bg-krem/20 text-krem rounded-lg px-3 py-2 transition"
    >
      {ok ? "✓ Tautan tersalin" : "🔗 Salin tautan laporan — bagikan ke grup RT/RW"}
    </button>
  );
}
