import { createClient } from "@supabase/supabase-js";
import { listWarga, getStats, mode } from "@/lib/store";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasil = { mode, url_module: SUPABASE_URL };
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  hasil.key_ada = Boolean(key);
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString());
    hasil.key_role = payload.role || "?"; // anon / service_role (hanya perannya, bukan kuncinya)
  } catch {
    hasil.key_role = "tidak-berformat-jwt";
  }

  // fungsi asli yang dipakai API kupon & ikhtisar:
  try {
    const w = await listWarga();
    hasil.listWarga_jumlah = w.length;
  } catch (e) {
    hasil.listWarga_jumlah = "ERR: " + e.message;
  }
  try {
    const s = await getStats();
    hasil.stats_kk_total = s.kk_total;
    hasil.stats_diperbarui = s.diperbarui;
  } catch (e) {
    hasil.stats_kk_total = "ERR: " + e.message;
  }

  // query PERSIS seperti di dalam listWarga, via klien baru:
  const c = createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
  const q = await c.from("warga").select("*, kupon(*)").eq("aktif", true).order("nama");
  hasil.query_persis_listWarga = { error: q.error?.message ?? null, jumlah: q.data?.length ?? 0 };

  return Response.json(hasil);
}
