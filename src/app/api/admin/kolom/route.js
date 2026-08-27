import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zxyftqrufaxzdvfvqpfq.supabase.co";
export async function GET() {
  const c = createClient(URL_SB, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const hasil = {};
  const uji = async (nama, fn) => {
    try {
      const r = await fn();
      hasil[nama] = { error: r?.error?.message ?? null, jumlah: r?.data?.length ?? 0 };
    } catch (e) {
      hasil[nama] = { lempar: e.message };
    }
  };
  await uji("select_bintang", () => c.from("warga").select("*").limit(5));
  await uji("select_ancalah", () => c.from("warga").select("ancalah"));
  await uji("select_ancalah_aktif", () => c.from("warga").select("ancalah").eq("aktif", true));
  await uji("select_id", () => c.from("warga").select("id"));
  await uji("transaksi", () => c.from("transaksi").select("tipe,jumlah"));
  await uji("kupon", () => c.from("kupon").select("status"));
  await uji("rsvp", () => c.from("rsvp").select("kehadiran,jumlah_tamu"));
  return Response.json(hasil);
}
