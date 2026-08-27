import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zxyftqrufaxzdvfvqpfq.supabase.co";
export async function GET() {
  const c = createClient(URL_SB, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const q = await c.from("warga").select("*").limit(1);
  return Response.json({
    error: q.error?.message ?? null,
    kolom: q.data?.[0] ? Object.keys(q.data[0]) : [],
    jumlah_baris: (await c.from("warga").select("id")).data?.length ?? 0,
  });
}
