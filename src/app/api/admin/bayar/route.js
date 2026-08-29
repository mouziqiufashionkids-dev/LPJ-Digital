import { tandaiLunas, getStats, getSettings } from "@/lib/store";
import { kirimKeGrupWA, formatNotifikasiLunas } from "@/lib/notif-wa";

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

  // Notifikasi WhatsApp otomatis saat kupon lunas
  let notifTerkirim = false;
  if (hasil.ok) {
    try {
      const [stats, settings] = await Promise.all([getStats(), getSettings()]);
      const pesan = formatNotifikasiLunas({
        nama: body.nama || "Warga",
        nominal: hasil.nominal,
        tanggal: body.tanggal || new Date().toISOString().slice(0, 10),
        stats,
        namaMasjid: settings.nama_masjid,
      });
      const notif = await kirimKeGrupWA(pesan);
      notifTerkirim = notif.terkirim;
    } catch {}
  }

  return Response.json(
    { ...hasil, notifWA: notifTerkirim },
    { status: hasil.ok ? 200 : 409 }
  );
}
