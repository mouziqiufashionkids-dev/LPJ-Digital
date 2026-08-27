import { perbaikiKupon } from "@/lib/store";

export const dynamic = "force-dynamic";

// Perbaikan satu klik (dilindungi middleware panitia):
// buatkan kupon utk setiap warga yang belum punya kupon.
export async function POST() {
  const hasil = await perbaikiKupon();
  return Response.json(hasil);
}
