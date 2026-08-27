import { kirimSaran, listSaran } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasil = await listSaran({ hanyaTampil: true });
  return Response.json({ hasil });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  const nama = typeof body.nama === "string" ? body.nama.slice(0, 60) : "";
  const pesan = typeof body.pesan === "string" ? body.pesan.trim() : "";
  if (pesan.length < 3 || pesan.length > 500) {
    return Response.json(
      { ok: false, pesan: "Pesan harus 3–500 karakter" },
      { status: 400 }
    );
  }
  await kirimSaran({ nama, pesan });
  return Response.json({ ok: true });
}
