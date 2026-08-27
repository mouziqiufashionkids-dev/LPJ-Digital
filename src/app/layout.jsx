import { Amiri, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export const metadata = {
  title: "LPJ Maulid Nabi — Iuran & Kas Terbuka",
  description:
    "Laporan pertanggungjawaban digital kegiatan Maulid Nabi ﷺ: iuran ancalah, dana masuk & keluar realtime, terbuka untuk seluruh warga.",
};

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
