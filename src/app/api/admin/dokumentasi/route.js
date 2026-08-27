import { tambahDokumentasi, hapusDokumentasi, simpanBerkas } from "@/lib/store";

export const dynamic = "force-dynamic";

const MAKS_BERKAS = 4 * 1024 * 1024; // 4 MB
const TIPE_OK = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }

  const judul = String(form.get("judul") || "").trim().slice(0, 100);
  const berkas = form.get("foto");

  if (!berkas || typeof berkas !== "object" || berkas.size === 0) {
    return Response.json({ ok: false, pesan: "Foto wajib dipilih" }, { status: 400 });
  }
  if (berkas.size > MAKS_BERKAS) {
    return Response.json({ ok: false, pesan: "Ukuran foto maksimal 4 MB" }, { status: 400 });
  }
  if (!TIPE_OK.includes(berkas.type)) {
    return Response.json({ ok: false, pesan: "Foto harus JPG, PNG, atau WebP" }, { status: 400 });
  }

  const ekst = berkas.type === "image/png" ? "png" : berkas.type === "image/webp" ? "webp" : "jpg";
  const nama = `dok-${crypto.randomUUID()}.${ekst}`;
  const buffer = Buffer.from(await berkas.arrayBuffer());

  let fotoUrl;
  try {
    const hasil = await simpanBerkas(nama, buffer, berkas.type);
    fotoUrl = hasil.url;
  } catch (e) {
    return Response.json({ ok: false, pesan: e.message }, { status: 500 });
  }

  const hasil = await tambahDokumentasi({ judul: judul || "Kegiatan", fotoUrl });
  return Response.json({ ...hasil, fotoUrl }, { status: hasil.ok ? 200 : 400 });
}

export async function DELETE(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  if (!body?.id) {
    return Response.json({ ok: false, pesan: "id wajib" }, { status: 400 });
  }
  const hasil = await hapusDokumentasi(body.id);
  return Response.json(hasil, { status: hasil.ok ? 200 : 404 });
}
