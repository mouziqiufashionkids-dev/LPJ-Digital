import { getSettings, getKonten, simpanPengaturan, simpanKonten, mode } from "@/lib/store";
import { KONTEN_DEFAULT } from "@/lib/konten";

export const dynamic = "force-dynamic";

// GET: pengaturan + teks saat ini + daftar kunci teks yang bisa diedit
export async function GET() {
  const [pengaturan, konten] = await Promise.all([getSettings(), getKonten()]);
  return Response.json({
    mode,
    pengaturan,
    konten,
    daftar: Object.entries(KONTEN_DEFAULT).map(([kunci, v]) => ({
      kunci,
      label: v.label,
      halaman: v.halaman,
      jenis: v.jenis,
    })),
  });
}

// POST: simpan perubahan pengaturan dan/atau teks
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }

  const p = body?.pengaturan || {};
  const bersih = {};

  const teks = (k, maks = 200) =>
    p[k] === undefined ? undefined : String(p[k]).trim().slice(0, maks);

  const kolomTeks = [
    "nama_masjid", "nama_kegiatan", "hijriah", "penyelenggara",
    "penyelenggara_singkat", "lokasi_acara", "kota_sholat",
    "rekening_bank", "rekening_no", "rekening_atas_nama", "qris_url",
  ];
  for (const k of kolomTeks) {
    const v = teks(k);
    if (v !== undefined) bersih[k] = v;
  }

  // nomor WA: hanya angka, wajib mulai 62
  if (p.kontak_wa !== undefined) {
    const wa = String(p.kontak_wa).replace(/[^0-9]/g, "").slice(0, 16);
    if (wa && !wa.startsWith("62")) {
      return Response.json(
        { ok: false, pesan: "Nomor WA harus diawali 62 (contoh: 628123456789)" },
        { status: 400 }
      );
    }
    bersih.kontak_wa = wa || "62";
  }

  // tanggal acara: ISO dari datetime-local (waktu Jakarta)
  if (p.tanggal_acara !== undefined && p.tanggal_acara) {
    const d = new Date(p.tanggal_acara);
    if (isNaN(d.getTime())) {
      return Response.json({ ok: false, pesan: "Tanggal tidak valid" }, { status: 400 });
    }
    bersih.tanggal_acara = d.toISOString();
  }

  if (Object.keys(bersih).length) {
    await simpanPengaturan(bersih);
  }
  if (body?.konten && typeof body.konten === "object") {
    await simpanKonten(body.konten);
  }
  return Response.json({ ok: true });
}
