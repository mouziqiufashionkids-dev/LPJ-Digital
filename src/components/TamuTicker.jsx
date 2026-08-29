import { listRsvp, getRsvpStats } from "@/lib/store";
import { tanggalSingkat } from "@/lib/format";

// Warna avatar per orang (deterministik dari nama)
const WARNA = [
  "bg-zamrud-600", "bg-emas", "bg-rose-500", "bg-indigo-500",
  "bg-teal-600", "bg-orange-500", "bg-purple-500", "bg-cyan-600",
];
function warnaNama(nama) {
  let hash = 0;
  for (const c of String(nama)) hash = (hash * 31 + c.charCodeAt(0)) % 997;
  return WARNA[hash % WARNA.length];
}

// Social proof strip: avatar berjejer + counter live
// Tampil di beranda — "X tamu sudah konfirmasi"
export default async function TamuTicker() {
  const [rsvp, stat] = await Promise.all([listRsvp(), getRsvpStats()]);
  const calon = rsvp.filter((r) => r.kehadiran !== "berhalangan");

  if (calon.length === 0) return null;

  const avatarOverlap = calon.slice(0, 8);
  const sisa = calon.length - avatarOverlap.length;

  return (
    <section className="mx-auto max-w-5xl px-4 mt-6">
      <div className="kartu p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 border-zamrud-200 bg-gradient-to-r from-zamrud-50 to-amber-50/50">
        {/* Avatar berjejer */}
        <div className="flex -space-x-2 sm:-space-x-3 shrink-0">
          {avatarOverlap.map((r) => (
            <span
              key={r.id}
              title={r.nama}
              className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${warnaNama(r.nama)} text-white text-xs sm:text-sm font-bold flex items-center justify-center border-2 border-white shadow-sm`}
            >
              {r.nama.trim().charAt(0).toUpperCase()}
            </span>
          ))}
          {sisa > 0 && (
            <span className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-zamrud-800 text-krem text-xs font-bold flex items-center justify-center border-2 border-white shadow-sm">
              +{sisa}
            </span>
          )}
        </div>

        {/* Teks live */}
        <div className="text-center sm:text-left min-w-0 flex-1">
          <p className="text-sm sm:text-base font-bold text-zamrud-800">
            {stat.hadir_tamu} tamu insya Allah hadir
          </p>
          <p className="text-xs text-zamrud-900/60 mt-0.5">
            dari {stat.hadir_nama} konfirmasi ·{" "}
            {stat.belum_pasti_nama > 0 && `${stat.belum_pasti_nama} masih menimbang`}
            {stat.belum_pasti_nama === 0 && "terima kasih semuanya!"}
          </p>
          {/* Bar mini */}
          <div className="mt-2 h-1.5 rounded-full bg-zamrud-100 overflow-hidden max-w-[200px] mx-auto sm:mx-0">
            <div
              className="h-full bg-gradient-to-r from-zamrud-500 to-emas rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (stat.hadir_nama / Math.max(1, stat.hadir_nama + stat.belum_pasti_nama + stat.berhalangan_nama)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Badge live */}
        <span className="pill bg-zamrud-600 text-white shrink-0 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emas animate-ping inline-block mr-1.5" />
          LIVE
        </span>
      </div>

      {/* Ticker: "baru saja" — 3 konfirmasi terakhir */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
        {calon.slice(0, 3).reverse().map((r) => (
          <span key={r.id} className="text-[11px] text-zamrud-900/50 bg-white border border-zamrud-100 rounded-full px-3 py-1 truncate max-w-[180px]">
            {r.kehadiran === "hadir" ? "🤝" : "🤔"} {r.nama.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="text-zamrud-900/30">· {tanggalSingkat(r.created_at)}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
