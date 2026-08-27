import { setSaranStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

// CATATAN KEAMANAN: lindungi dengan login panitia sebelum produksi.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  if (!body.id) {
    return Response.json({ ok: false, pesan: "id wajib" }, { status: 400 });
  }
  const hasil = await setSaranStatus(body.id, {
    tampil: body.tampil,
    ditindaklanjuti: body.ditindaklanjuti,
  });
  return Response.json(hasil, { status: hasil.ok ? 200 : 404 });
}
