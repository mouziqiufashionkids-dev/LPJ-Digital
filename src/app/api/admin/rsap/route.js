import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

// RSVP scrub: hapus semua RSVP yang bernama "Tes*" atau "PENANDA*" atau "Uji*"
export async function POST() {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const c = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

  // baca semua
  const baca = await c.from("rsvp").select("id,nama,kehadiran");
  if (baca.error) return Response.json({ ok: false, pesan: "baca: " + baca.error.message });

  // cari & hapus item tes
  const target = (baca.data || []).filter((r) =>
    /^(tes|penanda|uji|zzz)/i.test(String(r.nama).trim())
  );
  let terhapus = 0;
  for (const t of target) {
    const h = await c.from("rsvp").delete().eq("id", t.id);
    if (h.error) return Response.json({ ok: false, pesan: `hapus ${t.nama}: ${h.error.message}` });
    terhapus++;
  }

  // baca ulang
  const baca2 = await c.from("rsvp").select("id,nama");
  return Response.json({
    ok: true,
    sebelum: baca.data.length,
    terhapus,
    sisa: (baca2.data || []).length,
    daftar_sisa: (baca2.data || []).map((r) => r.nama),
  });
}
