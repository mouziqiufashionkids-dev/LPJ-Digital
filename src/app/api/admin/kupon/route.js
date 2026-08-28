import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

// Daftar kupon + QR untuk halaman cetak (dilindungi middleware).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "belum"; // belum | lunas | semua
  const kelas = searchParams.get("kelas") || "semua"; // semua | 1 | 2 | 3 | sponsor

  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const base = `${proto}://${host}`;

  const c = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store", next: { revalidate: 0 } }) },
  });
  const [kw, kp] = await Promise.all([
    c.from("warga").select("*, kupon(*)").order("nama"),
    c.from("pengaturan").select("*").eq("id", 1).single(),
  ]);
  const semua = (kw.data || []).map((w) => ({
    ...w,
    kupon: Array.isArray(w.kupon) ? (w.kupon[0] || null) : w.kupon,
  }));
  const pengaturan = kp.data || {};
  const daftar = semua.filter((w) => {
    const okStatus =
      status === "semua" ? true : (w.kupon?.status || "belum") === status;
    const okKelas = kelas === "semua" ? true : (w.kelas || "3") === kelas;
    return okStatus && okKelas;
  });

  const hasil = await Promise.all(
    daftar.map(async (w) => ({
      id: w.id,
      nama: w.nama,
      rt: w.rt,
      alamat: w.alamat,
      ancalah: w.ancalah,
      kelas: w.kelas || "3",
      status: w.kupon?.status || "belum",
      kode: w.kupon?.kode || "-",
      qr: w.kupon?.kode
        ? await QRCode.toString(`${base}/cek-iuran?kode=${w.kupon.kode}`, {
            type: "svg",
            margin: 0,
            width: 120,
            color: { dark: "#053827", light: "#ffffff" },
          })
        : null,
    }))
  );

  return Response.json({ jumlah: hasil.length, daftar: hasil, base, pengaturan });
}
