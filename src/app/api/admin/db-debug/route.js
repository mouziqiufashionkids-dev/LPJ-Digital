import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zxyftqrufaxzdvfvqpfq.supabase.co";

// Pemeriksa database (dilindungi sandi admin) — menampilkan error persis
// dari setiap bentuk query, untuk menemukan akar masalah.
export async function GET() {
  const c = createClient(URL_SB, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const hasil = {};

  const t1 = await c.from("warga").select("id,nama,kelas,ancalah").limit(3);
  hasil.tanpa_filter = {
    error: t1.error?.message ?? null,
    jumlah: t1.data?.length ?? 0,
    contoh: t1.data?.slice(0, 2) ?? [],
  };

  const t2 = await c.from("warga").select("id").eq("aktif", true).limit(3);
  hasil.filter_aktif = { error: t2.error?.message ?? null, jumlah: t2.data?.length ?? 0 };

  const t3 = await c.from("warga").select("id,nama,kupon(*)").limit(3);
  hasil.embed_kupon = { error: t3.error?.message ?? null, jumlah: t3.data?.length ?? 0 };

  const t4 = await c.from("warga").select("id,nama").order("nama").limit(3);
  hasil.urut_nama = { error: t4.error?.message ?? null, jumlah: t4.data?.length ?? 0 };

  const t5 = await c.from("kupon").select("id,kode,status").limit(3);
  hasil.tabel_kupon = { error: t5.error?.message ?? null, jumlah: t5.data?.length ?? 0 };

  return Response.json(hasil);
}
