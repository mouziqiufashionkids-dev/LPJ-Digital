import { listTransaksi } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipe = searchParams.get("tipe") || undefined;
  const hasil = await listTransaksi(tipe ? { tipe } : {});
  return Response.json({ hasil });
}
