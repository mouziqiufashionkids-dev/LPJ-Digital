import { getRsvpStats, kirimRsvp, listRsvp } from "@/lib/store";

export const dynamic = "force-dynamic";

const KEHADIRAN = ["hadir", "belum_pasti", "berhalangan"];

// daftar publik: hanya yang hadir / belum pasti, tanpa catatan pribadi
async function daftarPublik() {
  const semua = await listRsvp();
  return semua
    .filter((r) => r.kehadiran !== "berhalangan")
    .map(({ nama, rt, kehadiran, jumlah_tamu, created_at }) => ({
      nama, rt, kehadiran, jumlah_tamu, created_at,
    }));
}

export async function GET() {
  const [stat, daftar] = await Promise.all([getRsvpStats(), daftarPublik()]);
  return Response.json({ stat, daftar });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  const nama = String(body.nama || "").trim();
  const kehadiran = String(body.kehadiran || "");
  const jumlah = Number(body.jumlah_tamu) || 1;
  const catatan = String(body.catatan || "").slice(0, 200);
  const rt = String(body.rt || "").slice(0, 20);

  if (nama.length < 2 || nama.length > 80) {
    return Response.json(
      { ok: false, pesan: "Nama harus 2–80 karakter" },
      { status: 400 }
    );
  }
  if (!KEHADIRAN.includes(kehadiran)) {
    return Response.json(
      { ok: false, pesan: "Pilihan kehadiran tidak valid" },
      { status: 400 }
    );
  }
  const hasil = await kirimRsvp({ nama, rt, kehadiran, jumlah_tamu: jumlah, catatan });
  return Response.json(hasil, { status: hasil.ok ? 200 : 400 });
}
