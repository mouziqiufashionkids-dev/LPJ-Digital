import { getSettings, getKonten } from "@/lib/store";
import { isi } from "@/lib/konten";
import SearchIuran from "@/components/SearchIuran";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cek Iuran — Masjid Al-Hikmah",
};

export default async function CekIuranPage() {
  const [s, K] = await Promise.all([getSettings(), getKonten()]);
  return (
    <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="font-judul text-3xl font-bold text-zamrud-800">
        🔍 Cek Iuran Saya
      </h1>
      <p className="text-zamrud-900/70 mt-2">
        {isi(K["cekiuran.deskripsi"], s)}
      </p>

      <div className="mt-8">
        <SearchIuran namaKegiatan={s.nama_kegiatan} namaMasjid={s.nama_masjid} />
      </div>

      <div className="mt-10 kartu p-5 text-sm text-zamrud-900/70 space-y-2">
        <p className="font-semibold text-zamrud-800">Catatan:</p>
        <p>• Nama tidak ditemukan? Mungkin tercatat dengan nama lain — hubungi panitia.</p>
        <p>• Punya kupon cetak? Pindai QR di kupon, atau ketik kodenya (mis. MLD-0001).</p>
        <p>• Status <strong>belum diterima</strong> artinya panitia belum menerima/mencatat iuran Anda.</p>
        <p>• Kwitansi digital sah sebagai bukti iuran Anda sudah masuk. 📱</p>
      </div>
    </main>
  );
}
