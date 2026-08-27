"use client";
import { useState } from "react";

// Thumbnail nota/bukti yang bisa diklik untuk dilihat besar.
export default function NotaImg({ src, alt, kecil = false }) {
  const [buka, setBuka] = useState(false);
  if (!src) return null;
  return (
    <>
      <button
        onClick={() => setBuka(true)}
        title="Lihat nota / bukti"
        className="shrink-0 rounded-lg overflow-hidden border border-zamrud-200 hover:opacity-80 transition"
      >
        <img
          src={src}
          alt={alt || "Bukti nota"}
          className={`object-cover ${kecil ? "h-12 w-10" : "h-14 w-12"}`}
        />
      </button>

      {buka && (
        <div
          onClick={() => setBuka(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            className="max-w-sm w-full bg-white rounded-2xl overflow-hidden shadow-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={src} alt={alt || "Bukti nota"} className="w-full" />
            <div className="p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-zamrud-900">{alt}</p>
              <button
                onClick={() => setBuka(false)}
                className="pill bg-zamrud-600 text-white px-4 py-1.5"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
