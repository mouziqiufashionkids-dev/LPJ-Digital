import Link from "next/link";
import Logo from "@/components/Logo";
import FormLoginAdmin from "@/components/FormLoginAdmin";
import { mode } from "@/lib/store";

export const metadata = {
  title: "Masuk Panitia — Masjid Al-Hikmah",
};

export default function LoginAdminPage() {
  const petunjuk =
    mode === "demo"
      ? "Mode demo — sandi default: alhikmah2026 (ubah lewat ADMIN_PASSWORD di .env)"
      : null;

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-10 bg-zamrud-800/5">
      <Logo className="h-16 w-16 mb-4" />
      <FormLoginAdmin petunjuk={petunjuk} />
      <Link href="/" className="text-sm text-zamrud-700 hover:underline mt-6">
        ← Kembali ke halaman warga
      </Link>
    </main>
  );
}
