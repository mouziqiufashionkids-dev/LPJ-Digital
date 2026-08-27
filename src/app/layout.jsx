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
  const judul = `${s.nama_masjid} — Iuran & Laporan Terbuka`;
  const deskripsi = `Laporan pertanggungjawaban digital ${s.nama_kegiatan} dari ${s.nama_masjid}: iuran ancalah, dana masuk & keluar realtime, terbuka untuk seluruh warga.`;
  return {
    title: judul,
    description: deskripsi,
    icons: { icon: "/logo-masjid.svg" },
    openGraph: {
      title: judul,
      description: deskripsi,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: judul }],
    },
    twitter: {
      card: "summary_large_image",
      title: judul,
      description: deskripsi,
      images: ["/og-image.png"],
    },
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
