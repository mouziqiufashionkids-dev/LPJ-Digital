import { tambahWargaBatch, hapusWarga, kosongkanWarga } from "@/lib/store";

export const dynamic = "force-dynamic";

// CATATAN KEAMANAN: lindungi dengan login panitia sebelum produksi.
const KELAS_PRESET = { "1": 150000, "2": 100000, "3": 75000 };

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  const paksa = Boolean(body?.paksa); // ganti total: kosongkan dulu, tanpa cek dobel
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 500) : [];
  const bersih = rows
    .map((r) => {
      const kelas = ["1", "2", "3", "sponsor"].includes(r?.kelas) ? r.kelas : "3";
      return {
        nama: String(r?.nama ?? "").trim().slice(0, 80),
        rt: String(r?.rt ?? "").trim().slice(0, 20),
        alamat: String(r?.alamat ?? "").trim().slice(0, 120),
        kelas,
        ancalah: Number(r?.ancalah) || (KELAS_PRESET[kelas] ?? 0),
      };
    })
    .filter((r) => r.nama);
  if (!bersih.length) {
    return Response.json(
      { ok: false, pesan: "Tidak ada data valid — pastikan nama terisi" },
      { status: 400 }
    );
  }
  if (paksa) {
    const k = await kosongkanWarga();
    if (!k.ok) {
      return Response.json({ ok: false, pesan: "Gagal mengosongkan data lama: " + k.pesan }, { status: 500 });
    }
  }
  const hasil = await tambahWargaBatch(bersih, { paksa });
  return Response.json(hasil, { status: hasil.ok ? 200 : 400 });
}

export async function DELETE(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  // terima satu id ATAU daftar ids (untuk bersih-bersih data dobel)
  const ids = Array.isArray(body?.ids)
    ? body.ids.map((x) => String(x)).slice(0, 500)
    : body?.id
    ? [String(body.id)]
    : [];
  if (!ids.length) {
    return Response.json({ ok: false, pesan: "id wajib" }, { status: 400 });
  }
  let terhapus = 0;
  let galat = "";
  for (const id of ids) {
    const hasil = await hapusWarga(id);
    if (hasil.ok) terhapus++;
    else if (!galat) galat = hasil.pesan || "Gagal";
  }
  return Response.json({ ok: terhapus > 0, terhapus, pesan: galat || null });
}
