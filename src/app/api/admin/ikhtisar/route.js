import { mode } from "@/lib/store";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

const fetchNoStore = (url, options) =>
  fetch(url, { ...options, cache: "no-store", next: { revalidate: 0 } });

async function bacaSegar() {
  const c = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { fetch: fetchNoStore },
  });
  const [p, st, w, t, s, r, rs, dk] = await Promise.all([
    c.from("pengaturan").select("*").eq("id", 1).single(),
    (async () => {
      const [ws, ts, ks] = await Promise.all([
        c.from("warga").select("ancalah"),
        c.from("transaksi").select("tipe,jumlah"),
        c.from("kupon").select("status"),
      ]);
      const masuk = (ts.data || []).filter((x) => x.tipe === "masuk").reduce((a, x) => a + x.jumlah, 0);
      const keluar = (ts.data || []).filter((x) => x.tipe === "keluar").reduce((a, x) => a + x.jumlah, 0);
      const target = (ws.data || []).reduce((a, x) => a + x.ancalah, 0);
      return {
        target_dana: target, dana_masuk: masuk, dana_keluar: keluar,
        sisa: masuk - keluar, persen: target ? Math.round((masuk / target) * 100) : 0,
        kk_total: (ws.data || []).length,
        kk_lunas: (ks.data || []).filter((x) => x.status === "lunas").length,
        transaksi_masuk: (ts.data || []).filter((x) => x.tipe === "masuk").length,
        transaksi_keluar: (ts.data || []).filter((x) => x.tipe === "keluar").length,
        diperbarui: new Date().toLocaleString("id-ID", {
          dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
        }),
      };
    })(),
    (async () => {
      const kw = await c.from("warga").select("*, kupon(*)").order("nama");
      return (kw.data || []).map((w) => ({
        ...w,
        kupon: Array.isArray(w.kupon) ? (w.kupon[0] || null) : w.kupon,
      }));
    })(),
    c.from("transaksi").select("*").order("tanggal", { ascending: false }),
    c.from("kotak_saran").select("*").order("created_at", { ascending: false }),
    c.from("rsvp").select("*").order("created_at", { ascending: false }),
    (async () => {
      const kr = await c.from("rsvp").select("kehadiran,jumlah_tamu");
      const r = kr.data || [];
      const hadir = r.filter((x) => x.kehadiran === "hadir");
      const belum = r.filter((x) => x.kehadiran === "belum_pasti");
      return {
        hadir_nama: hadir.length,
        hadir_tamu: hadir.reduce((a, x) => a + x.jumlah_tamu, 0),
        belum_pasti_nama: belum.length,
        belum_pasti_tamu: belum.reduce((a, x) => a + x.jumlah_tamu, 0),
        berhalangan_nama: r.filter((x) => x.kehadiran === "berhalangan").length,
      };
    })(),
    c.from("dokumentasi").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    pengaturan: p.data || {}, stats: st, warga: w,
    transaksi: t.data || [], saran: s.data || [],
    rsvp: r.data || [], rsvpStat: rs, dokumentasi: dk.data || [],
  };
}

export const dynamic = "force-dynamic";

// Semua data panel panitia dalam satu panggilan (dilindungi middleware).
export async function GET() {
  const data = await bacaSegar();
  return Response.json({ mode, ...data });
}
