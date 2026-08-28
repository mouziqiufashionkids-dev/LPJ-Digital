import { rupiah } from "@/lib/format";

export default function StatCard({ ikon, label, nilai, catatan, aksen = "hijau" }) {
  const warna =
    aksen === "merah"
      ? "text-rose-700 bg-rose-50 border-rose-100"
      : aksen === "emas"
      ? "text-emas-gelap bg-amber-50 border-amber-100"
      : "text-zamrud-700 bg-zamrud-50 border-zamrud-100";
  return (
    <div className={`rounded-2xl border p-4 ${warna}`}>
      <div className="text-xl sm:text-2xl">{ikon}</div>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide mt-1.5 sm:mt-2 opacity-80">
        {label}
      </p>
      <p className="text-base sm:text-xl md:text-2xl font-bold mt-0.5 text-zamrud-900 break-all leading-snug">
        {nilai}
      </p>
      {catatan && <p className="text-[10px] sm:text-xs mt-1 text-zamrud-900/60 leading-snug">{catatan}</p>}
    </div>
  );
}
