import {
  getSettings, getStats, listWarga, listTransaksi,
  listSaran, listRsvp, getRsvpStats, listDokumentasi, mode,
} from "@/lib/store";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

// Semua data panel panitia dalam satu panggilan (dilindungi middleware).
export async function GET() {
  // Baca RSVP dengan klien BARU (hindari jeda baca pada singleton)
  const klienBaru = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const rsvpBaru = await klienBaru.from("rsvp").select("*").order("created_at", { ascending: false });
  const [pengaturan, stats, warga, transaksi, saran, rsvpStat, dokumentasi] =
    await Promise.all([
      getSettings(),
      getStats(),
      listWarga(),
      listTransaksi({}),
      listSaran({ hanyaTampil: false }),
      getRsvpStats(),
      listDokumentasi(),
    ]);
  const rsvp = rsvpBaru.data || [];
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
