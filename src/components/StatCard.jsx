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
      <div className="text-2xl">{ikon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide mt-2 opacity-80">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold mt-0.5 text-zamrud-900">
        {nilai}
      </p>
      {catatan && <p className="text-xs mt-1 text-zamrud-900/60">{catatan}</p>}
    </div>
  );
}
