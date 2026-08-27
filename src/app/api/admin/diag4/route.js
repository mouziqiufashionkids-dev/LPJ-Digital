import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const hasil = {};

  // 1) daftar SEMUA tabel yang terekspos (via spesifikasi REST)
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const spec = await r.json();
    hasil.semua_tabel = Object.keys(spec.definitions || {});
  } catch (e) {
    hasil.semua_tabel = "ERR: " + e.message;
  }

  const c = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

  // 2) tulis penanda, baca ulang berkali-kali (pemantau pemulih otomatis)
  const t0 = Date.now();
  await c.from("warga").insert({ nama: `PENANDA-${t0}`, kelas: "3", ancalah: 0 });
  const pantau = [];
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const r1 = await c.from("warga").select("id,nama").order("id", { ascending: false }).limit(3);
    pantau.push({
      detik: (i + 1) * 2,
      error: r1.error?.message ?? null,
      teratas: (r1.data || []).map((x) => x.nama).slice(0, 2),
    });
  }
  hasil.pantau_penanda = pantau;

  return Response.json(hasil);
}
