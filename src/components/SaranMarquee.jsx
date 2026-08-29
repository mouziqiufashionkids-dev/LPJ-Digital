import { listSaran } from "@/lib/store";

// Testimonial marquee — saran warga bergaya social proof
// Auto-scroll horizontal di beranda
export default async function SaranMarquee() {
  const daftar = await listSaran({ hanyaTampil: true });

  if (daftar.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 mt-10 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-judul text-2xl font-bold text-zamrud-800">
          💬 Suara Warga
        </h2>
        <span className="pill bg-zamrud-50 text-zamrud-700 border border-zamrud-100">
          {daftar.length} saran masuk
        </span>
      </div>

      {/* Marquee track — CSS animation scroll horizontal */}
      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {daftar.map((s) => (
            <div
              key={s.id}
              className="kartu p-5 min-w-[280px] sm:min-w-[320px] snap-center shrink-0 relative"
            >
              {/* Quote besar */}
              <span className="absolute top-2 right-4 text-5xl text-zamrud-100 font-judul leading-none select-none">
                &ldquo;
              </span>

              <div className="flex items-center gap-2.5 mb-3">
                <span className="h-9 w-9 rounded-full bg-zamrud-100 text-zamrud-700 text-sm font-bold flex items-center justify-center shrink-0">
                  {(s.nama || "W").trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zamrud-900 truncate">
                    {s.nama || "Warga Anonim"}
                  </p>
                  <span className="text-[10px] text-emas-gelap">
                    {"★".repeat(5)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-zamrud-900/80 leading-relaxed line-clamp-4">
                {s.pesan}
              </p>

              {s.ditindaklanjuti && (
                <span className="pill bg-zamrud-100 text-zamrud-700 mt-3 text-[10px]">
                  ✅ Ditindaklanjuti
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Fade edge */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-krem to-transparent pointer-events-none" />
      </div>

      <p className="text-center text-xs text-zamrud-900/40 mt-2 sm:hidden">
        ← geser untuk lihat lainnya →
      </p>
    </section>
  );
}
