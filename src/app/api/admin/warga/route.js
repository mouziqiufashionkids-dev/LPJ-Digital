import { tambahWargaBatch, hapusWarga } from "@/lib/store";

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
  const hasil = await tambahWargaBatch(bersih);
  return Response.json(hasil, { status: hasil.ok ? 200 : 400 });
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
  const hasil = await hapusWarga(body.id);
  return Response.json(hasil, { status: hasil.ok ? 200 : 404 });
}
