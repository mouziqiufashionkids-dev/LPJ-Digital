import { createClient } from "@supabase/supabase-js";
import { listWarga, getStats, mode } from "@/lib/store";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

// Pemeriksa database (dilindungi middleware panitia) — menampilkan error
// persis dari setiap bentuk query + peran kunci (anon/service_role),
// untuk menemukan akar masalah.
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
    hasil.listWarga_contoh = w.slice(0, 2).map((x) => ({
      id: x.id,
      nama: x.nama,
      kupon: x.kupon ? { kode: x.kupon.kode, status: x.kupon.status } : null,
    }));
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

  const c = createClient(SUPABASE_URL, key, { auth: { persistSession: false } });

  const t1 = await c.from("warga").select("id,nama,kelas,ancalah").limit(3);
  hasil.tanpa_filter = {
    error: t1.error?.message ?? null,
    jumlah: t1.data?.length ?? 0,
    contoh: t1.data?.slice(0, 2) ?? [],
  };

  const t2 = await c.from("warga").select("id").eq("aktif", true).limit(3);
  hasil.filter_aktif = { error: t2.error?.message ?? null, jumlah: t2.data?.length ?? 0 };

  const t2b = await c.from("warga").select("aktif").limit(1);
  hasil.kolom_aktif = { error: t2b.error?.message ?? null, jumlah: t2b.data?.length ?? 0 };

  const t3 = await c.from("warga").select("id,nama,kupon(*)").limit(3);
  hasil.embed_kupon = { error: t3.error?.message ?? null, jumlah: t3.data?.length ?? 0 };

  const t4 = await c.from("warga").select("id,nama").order("nama").limit(3);
  hasil.urut_nama = { error: t4.error?.message ?? null, jumlah: t4.data?.length ?? 0 };

  const t5 = await c.from("kupon").select("id,kode,status").limit(3);
  hasil.tabel_kupon = { error: t5.error?.message ?? null, jumlah: t5.data?.length ?? 0 };

  const t6 = await c.from("warga").select("id", { count: "exact", head: true });
  hasil.jumlah_warga = { error: t6.error?.message ?? null, jumlah: t6.count ?? 0 };

  const t7 = await c.from("kupon").select("id", { count: "exact", head: true });
  hasil.jumlah_kupon = { error: t7.error?.message ?? null, jumlah: t7.count ?? 0 };

  const t8 = await c.from("warga").select("id,nama").eq("kelas", "1").limit(3);
  hasil.filter_kelas = { error: t8.error?.message ?? null, jumlah: t8.data?.length ?? 0 };

  const t9 = await c.from("transaksi").select("id", { count: "exact", head: true });
  hasil.jumlah_transaksi = { error: t9.error?.message ?? null, jumlah: t9.count ?? 0 };

  const t10 = await c.from("rsvp").select("id", { count: "exact", head: true });
  hasil.jumlah_rsvp = { error: t10.error?.message ?? null, jumlah: t10.count ?? 0 };

  return Response.json(hasil);
}
