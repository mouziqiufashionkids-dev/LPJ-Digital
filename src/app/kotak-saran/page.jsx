import { getSettings, getKonten, listSaran } from "@/lib/store";
import { tanggalSingkat } from "@/lib/format";
import { isi } from "@/lib/konten";
import SaranForm from "@/components/SaranForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kotak Saran — LPJ Maulid Nabi",
};

export default async function KotakSaranPage() {
  const [s, K, daftar] = await Promise.all([
    getSettings(),
    getKonten(),
    listSaran({ hanyaTampil: true }),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="font-judul text-3xl font-bold text-zamrud-800">
        📮 Kotak Saran Warga
      </h1>
      <p className="text-zamrud-900/70 mt-2">
        {isi(K["kotaksaran.deskripsi"], s)}
      </p>

      <div className="mt-8">
        <SaranForm />
      </div>

      <h2 className="font-judul text-xl font-bold text-zamrud-800 mt-12 mb-2">
        Saran dari Warga
      </h2>
      <p className="text-xs text-zamrud-900/50 mb-4">
        {daftar.length} saran sudah disetujui panitia
      </p>
      <div className="columns-1 sm:columns-2 gap-4 space-y-4">
        {daftar.map((s, i) => (
          <div key={s.id} className={`kartu p-5 break-inside-avoid relative ${i % 3 === 0 ? "border-l-4 border-l-emas" : i % 3 === 1 ? "border-l-4 border-l-zamrud-400" : "border-l-4 border-l-rose-300"}`}>
            <span className="absolute top-1 right-3 text-4xl text-zamrud-100 font-judul leading-none select-none">
              &ldquo;
            </span>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-9 w-9 rounded-full bg-zamrud-100 text-zamrud-700 text-sm font-bold flex items-center justify-center shrink-0">
                {(s.nama || "W").trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-zamrud-900 text-sm truncate">
                  {s.nama || "Warga Anonim"}
                </p>
                <p className="text-[10px] text-emas-gelap">{"★".repeat(5)}</p>
              </div>
            </div>
            <p className="text-sm text-zamrud-900/80 leading-relaxed">{s.pesan}</p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-zamrud-900/40">
                {tanggalSingkat(s.created_at)}
              </p>
              {s.ditindaklanjuti && (
                <span className="pill bg-zamrud-100 text-zamrud-700 text-[10px]">
                  ✅ Ditindaklanjuti
                </span>
              )}
            </div>
          </div>
        ))}
        {daftar.length === 0 && (
          <p className="kartu p-5 text-sm text-zamrud-900/60">
            Belum ada saran yang ditampilkan. Jadilah yang pertama!
          </p>
        )}
      </div>
    </main>
  );
}
