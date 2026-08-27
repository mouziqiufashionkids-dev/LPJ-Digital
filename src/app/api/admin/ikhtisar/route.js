import {
  getSettings, getStats, listWarga, listTransaksi,
  listSaran, listRsvp, getRsvpStats, listDokumentasi, mode,
} from "@/lib/store";

export const dynamic = "force-dynamic";

// Semua data panel panitia dalam satu panggilan (dilindungi middleware).
export async function GET() {
  const [pengaturan, stats, warga, transaksi, saran, rsvp, rsvpStat, dokumentasi] =
    await Promise.all([
      getSettings(),
      getStats(),
      listWarga(),
      listTransaksi({}),
      listSaran({ hanyaTampil: false }),
      listRsvp(),
      getRsvpStats(),
      listDokumentasi(),
    ]);
  return Response.json({
    mode,
    pengaturan,
    stats,
    warga,
    transaksi,
    saran,
    rsvp,
    rsvpStat,
    dokumentasi,
  });
}
