import { tandaiLunas } from "@/lib/store";

export const dynamic = "force-dynamic";

// CATATAN KEAMANAN: tahap berikutnya lindungi dengan login panitia
// (middleware + Supabase Auth) sebelum dipakai di produksi.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  if (!body.wargaId) {
    return Response.json({ ok: false, pesan: "wargaId wajib" }, { status: 400 });
  }
  const hasil = await tandaiLunas(body.wargaId, {
    tanggal: body.tanggal,
    metode: body.metode,
    petugas: body.petugas,
  });
  return Response.json(hasil, { status: hasil.ok ? 200 : 409 });
}
