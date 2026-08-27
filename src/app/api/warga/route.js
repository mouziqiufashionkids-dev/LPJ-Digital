import { cariWarga } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const hasil = await cariWarga(q);
  return Response.json({ hasil });
}
