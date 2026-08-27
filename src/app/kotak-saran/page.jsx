import { listSaran } from "@/lib/store";
import { tanggalSingkat } from "@/lib/format";
import SaranForm from "@/components/SaranForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kotak Saran — LPJ Maulid Nabi",
};

export default async function KotakSaranPage() {
  const daftar = await listSaran({ hanyaTampil: true });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-judul text-3xl font-bold text-zamrud-800">
        📮 Kotak Saran Warga
      </h1>
      <p className="text-zamrud-900/70 mt-2">
        Sampaikan saran, masukan, atau doa untuk kegiatan Maulid Nabi ﷺ.
        Boleh anonim. Panitia membaca semuanya.
      </p>

      <div className="mt-8">
        <SaranForm />
      </div>

      <h2 className="font-judul text-xl font-bold text-zamrud-800 mt-12 mb-4">
        Saran dari warga
      </h2>
      <div className="space-y-3">
        {daftar.map((s) => (
          <div key={s.id} className="kartu p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-zamrud-900">
                {s.nama || "Warga Anonim"}
              </p>
              {s.ditindaklanjuti && (
                <span className="pill bg-zamrud-100 text-zamrud-700">
                  ✅ Ditindaklanjuti panitia
                </span>
              )}
            </div>
            <p className="text-sm text-zamrud-900/80 mt-2">{s.pesan}</p>
            <p className="text-xs text-zamrud-900/40 mt-2">
              {tanggalSingkat(s.created_at)}
            </p>
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
