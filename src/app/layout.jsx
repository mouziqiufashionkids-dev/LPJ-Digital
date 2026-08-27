import { Amiri, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/store";

const judul = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-judul",
});

const isi = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-isi",
});

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: `${s.nama_masjid} — Iuran & Laporan Terbuka`,
    description: `Laporan pertanggungjawaban digital ${s.nama_kegiatan} dari ${s.nama_masjid}: iuran ancalah, dana masuk & keluar realtime, terbuka untuk seluruh warga.`,
    icons: { icon: "/logo-masjid.svg" },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${judul.variable} ${isi.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
