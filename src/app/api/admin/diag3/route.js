import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const c = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });
  const hasil = {};

  // 1) SEMUA baris — id & nama saja (data mentah, tanpa sendi)
  const r1 = await c.from("warga").select("id,nama,kelas,ancalah,aktif").limit(200);
  hasil.semua_baris_error = r1.error?.message ?? null;
  hasil.total_dibaca = r1.data?.length ?? 0;
  hasil.baris = (r1.data || []).slice(0, 10).map((x) => ({
    id: x.id, nama: String(x.nama).slice(0, 18), kelas: x.kelas,
    ancalah: x.ancalah, aktif: x.aktif === null ? "NULL" : x.aktif,
  }));
  hasil.ada_penanda = (r1.data || []).some((x) => String(x.nama).includes("PENANDA"));

  // 2) coba HAPUS penanda — tampilkan error aslinya
  const penanda = (r1.data || []).find((x) => String(x.nama).includes("PENANDA"));
  if (penanda) {
    const h = await c.from("warga").delete().eq("id", penanda.id);
    hasil.hapus_penanda = { id: penanda.id, error: h.error?.message ?? null, sukses: !h.error };
  } else {
    hasil.hapus_penanda = "penanda tidak ditemukan di select *";
  }

  // 3) coba order by id (error-nya diperlihatkan)
  const r3 = await c.from("warga").select("id").order("id", { ascending: false }).limit(3);
  hasil.order_id = { error: r3.error?.message ?? null, jumlah: r3.data?.length ?? 0 };

  // 4) jumlah kupon
  const r4 = await c.from("kupon").select("id", { count: "exact", head: true });
  hasil.kupon_total = r4.count ?? null;

  return Response.json(hasil);
}
