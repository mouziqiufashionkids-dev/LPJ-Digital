import { rupiah } from "@/lib/format";

export default function ProgressBar({ terkumpul, target, kkLunas, kkTotal }) {
  const persen = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-zamrud-700">
          Dana terkumpul dari target ancalah warga
        </span>
        <span className="text-sm font-bold text-zamrud-700">{persen}%</span>
      </div>

      {/* termometer progress */}
      <div
        className="h-8 rounded-full bg-zamrud-50 border-2 border-zamrud-100 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={persen}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-zamrud-600 via-zamrud-500 to-emas transition-all duration-700"
          style={{ width: `${persen}%` }}
        />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 gap-y-1">
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-zamrud-800 tracking-tight break-all">
          {rupiah(terkumpul)}
        </span>
        <span className="text-sm sm:text-lg text-zamrud-900/60">
          dari {rupiah(target)}
        </span>
      </div>

      <p className="mt-2 inline-flex items-center gap-2 text-sm bg-zamrud-50 text-zamrud-800 rounded-xl px-3 py-2 border border-zamrud-100">
        🏠 <strong className="font-bold">{kkLunas} dari {kkTotal} KK</strong>
        <span className="font-normal">sudah melunasi iuran (ancalah)</span>
      </p>
    </div>
  );
}
