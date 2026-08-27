import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_URL_FALLBACK } from "@/lib/supabase-store";
import { listWarga } from "@/lib/store";

export const dynamic = "force-dynamic";

async function aman(nama, fn, hasil) {
  try {
    hasil[nama] = await fn();
  } catch (e) {
    hasil[nama] = "ERR: " + (e?.message || String(e));
  }
  return hasil;
}

export async function GET() {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const hasil = {
    env_url: process.env.NEXT_PUBLIC_SUPABASE_URL || "(tidak diset)",
    module_url: SUPABASE_URL,
  };
  const klien = (u) => createClient(u, KEY, { auth: { persistSession: false } });

  await aman("hitung_app", async () => {
    const r = await klien(SUPABASE_URL).from("warga").select("id", { count: "exact", head: true });
    return { total: r.count ?? null, error: r.error?.message ?? null };
  }, hasil);

  await aman("listWarga_jumlah", async () => (await listWarga()).length, hasil);

  await aman("proyek_env", async () => {
    if (!hasil.env_url || hasil.env_url === SUPABASE_URL_FALLBACK) return "(sama dengan fallback)";
    const r = await klien(hasil.env_url).from("warga").select("id", { count: "exact", head: true });
    return { total: r.count ?? null, error: r.error?.message ?? null };
  }, hasil);

  await aman("proyek_fallback", async () => {
    const r = await klien(SUPABASE_URL_FALLBACK).from("warga").select("id", { count: "exact", head: true });
    return { total: r.count ?? null, error: r.error?.message ?? null };
  }, hasil);

  await aman("id_tertinggi", async () => {
    const r = await klien(SUPABASE_URL).from("warga").select("id,nama").order("id", { ascending: false }).limit(5);
    return r.data || [];
  }, hasil);

  return Response.json(hasil);
}
