import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_URL_FALLBACK } from "@/lib/supabase-store";
import { listWarga } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasil = {
    env_url: process.env.NEXT_PUBLIC_SUPABASE_URL || "(tidak diset)",
    module_url: SUPABASE_URL,
    fallback_url: SUPABASE_URL_FALLBACK,
  };

  // hitung via jalur aplikasi (head-only, efisien)
  const r1 = await createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } })
    .from("warga").select("id", { count: "exact", head: true });
  hasil.hitung_app = { total: r1.count, error: r1.error?.message ?? null };

  // listWarga (jalur panel)
  try {
    hasil.listWarga_jumlah = (await listWarga()).length;
  } catch (e) {
    hasil.listWarga_jumlah = "ERR: " + e.message;
  }

  // kalau env URL berbeda dari fallback, cek proyek env langsung
  if (hasil.env_url && hasil.env_url !== SUPABASE_URL_FALLBACK) {
    const rEnv = await createClient(hasil.env_url, KEY, { auth: { persistSession: false } })
      .from("warga").select("id", { count: "exact", head: true });
    hasil.proyek_env = { total: rEnv.count, error: rEnv.error?.message ?? null };
  }

  // cek proyek fallback langsung
  const rFb = await createClient(SUPABASE_URL_FALLBACK, KEY, { auth: { persistSession: false } })
    .from("warga").select("id", { count: "exact", head: true });
  hasil.proyek_fallback = { total: rFb.count, error: rFb.error?.message ?? null };

  // 5 id tertinggi (melihat duplikasi massal)
  const rHigh = await createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } })
    .from("warga").select("id,nama").order("id", { ascending: false }).limit(5);
  hasil.id_tertinggi = rHigh.data || [];

  return Response.json(hasil);
}
