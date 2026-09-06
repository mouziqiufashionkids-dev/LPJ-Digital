import { getKonten } from "@/lib/store";

// Teks berjalan (marquee) di bawah header — ucapan terima kasih
export default async function TeksBerjalan() {
  const K = await getKonten();
  const teks = K["marquee.teks"] || "";
  if (!teks.trim()) return null;

  return (
    <div
      className="no-print bg-zamrud-700 text-krem overflow-hidden border-b border-emas/30"
      style={{ minHeight: "36px" }}
    >
      <div className="flex items-center whitespace-nowrap py-1.5 animate-marquee">
        {/* Duplikat teks untuk loop mulus */}
        <span className="text-xs sm:text-sm text-krem/90 px-4 inline-block">
          🤲 {teks}
        </span>
        <span className="text-xs sm:text-sm text-krem/90 px-4 inline-block">
          🤲 {teks}
        </span>
        <span className="text-xs sm:text-sm text-krem/90 px-4 inline-block">
          🤲 {teks}
        </span>
      </div>
    </div>
  );
}
