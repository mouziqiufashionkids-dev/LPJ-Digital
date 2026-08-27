"use client";

export default function TombolCetak() {
  return (
    <button
      onClick={() => window.print()}
      className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang text-sm px-4 py-2.5"
    >
      🖨️ Cetak / Simpan PDF
    </button>
  );
}
