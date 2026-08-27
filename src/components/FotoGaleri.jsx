"use client";
import { useState } from "react";

// Galeri foto dokumentasi — klik untuk memperbesar.
export default function FotoGaleri({ daftar }) {
  const [buka, setBuka] = useState(null);

  if (!daftar?.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {daftar.map((d) => (
          <button
            key={d.id}
            onClick={() => setBuka(d)}
            className="group relative rounded-2xl overflow-hidden border border-zamrud-100 shadow-kartu aspect-[4/3]"
          >
            <img
              src={d.foto_url}
              alt={d.judul}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zamrud-900/80 to-transparent px-3 py-2 text-left">
              <span className="block text-xs font-semibold text-krem truncate">
                {d.judul}
              </span>
            </span>
          </button>
        ))}
      </div>

      {buka && (
        <div
          onClick={() => setBuka(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            className="max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={buka.foto_url} alt={buka.judul} className="w-full" />
            <div className="p-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zamrud-900">{buka.judul}</p>
              <button
                onClick={() => setBuka(null)}
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
