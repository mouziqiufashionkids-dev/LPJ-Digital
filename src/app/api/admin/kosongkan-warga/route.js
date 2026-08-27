import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-store";

export const dynamic = "force-dynamic";

// Mulai ulang data warga: hapus SEMUA kupon + SEMUA warga.
// (Dilindungi middleware panitia.) Untuk dipakai saat import ulang
// Excel yang diperbaiki — anti-dobel akan menghalangi jika data lama masih ada.
export async function POST() {
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const c = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

  const h1 = await c.from("kupon").delete().neq("id", -1);
  const h2 = await c.from("warga").delete().neq("id", -1);

  // hitung ulang beberapa kali (antisipasi jeda baca)
  let sisaWarga = null;
  let sisaKupon = null;
  for (let i = 0; i < 3; i++) {
    const w = await c.from("warga").select("id", { count: "exact", head: true });
    const k = await c.from("kupon").select("id", { count: "exact", head: true });
    sisaWarga = w.count ?? 0;
    sisaKupon = k.count ?? 0;
    if (sisaWarga === 0 && sisaKupon === 0) break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  return Response.json({
    ok: !h1.error && !h2.error && sisaWarga === 0 && sisaKupon === 0,
    pesan: h1.error?.message || h2.error?.message || null,
    sisa_warga: sisaWarga,
    sisa_kupon: sisaKupon,
  });
}
