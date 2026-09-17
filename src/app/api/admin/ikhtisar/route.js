import {
  mode,
  getSettings,
  getStats,
  listWarga,
  listTransaksi,
  listSaran,
  listRsvp,
  getRsvpStats,
  listDokumentasi,
} from "@/lib/store";

// Semua data panel panitia dalam satu panggilan (dilindungi middleware).
// Menggunakan lapisan store.js — otomatis cocok mode:
//   - env Supabase terisi  -> database sungguhan
//   - belum terisi         -> mode demo (data contoh)
async function bacaSegar() {
  const [p, st, w, t, s, r, rs, dk] = await Promise.all([
    getSettings(),
    getStats(),
    listWarga(),
    listTransaksi({}),
    listSaran({ hanyaTampil: false }),
    listRsvp(),
    getRsvpStats(),
    listDokumentasi(),
  ]);
  return {
    pengaturan: p, stats: st, warga: w,
    transaksi: t, saran: s,
    rsvp: r, rsvpStat: rs, dokumentasi: dk,
  };
}

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await bacaSegar();
  return Response.json({ mode, ...data });
}
