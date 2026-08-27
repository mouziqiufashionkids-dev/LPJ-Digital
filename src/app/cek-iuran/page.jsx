import SearchIuran from "@/components/SearchIuran";

export const metadata = {
  title: "Cek Iuran — LPJ Maulid Nabi",
};

export default function CekIuranPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-judul text-3xl font-bold text-zamrud-800">
        🔍 Cek Iuran Saya
      </h1>
      <p className="text-zamrud-900/70 mt-2">
        Sudah bayar iuran Maulid Nabi? Pastikan sudah diterima dan tercatat
        panitia. Cukup ketik nama — tanpa login, tanpa data pribadi.
      </p>

      <div className="mt-8">
        <SearchIuran />
      </div>

      <div className="mt-10 kartu p-5 text-sm text-zamrud-900/70 space-y-2">
        <p className="font-semibold text-zamrud-800">Catatan:</p>
        <p>• Nama tidak ditemukan? Mungkin tercatat dengan nama lain — hubungi panitia.</p>
        <p>• Status <strong>belum diterima</strong> artinya panitia belum menerima/mencatat iuran Anda.</p>
        <p>• Kwitansi digital sah sebagai bukti iuran Anda sudah masuk. 📱</p>
      </div>
    </main>
  );
}
