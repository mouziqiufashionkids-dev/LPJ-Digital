export const dynamic = "force-dynamic";

// DIAGNOSTIK ENV — sementara: menunjukkan variabel mana yang terbaca
// oleh server produksi. TIDAK menampilkan nilai rahasia (hanya ada/tidak).
export function GET() {
  const env = process.env;
  // nama variabel yang berkaitan (bukan nilainya)
  const namaTerkait = Object.keys(env)
    .filter((k) => /SUPABASE|ADMIN|PASSWORD/i.test(k))
    .map((k) => k.trim());
  return Response.json({
    versi_kode: "v2-sandi",
    waktu: new Date().toISOString(),
    supabase_url_ada: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    supabase_url_nilai: env.NEXT_PUBLIC_SUPABASE_URL || null, // bukan rahasia
    service_key_ada: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    admin_sandi_ada: Boolean(env.ADMIN_PASSWORD),
    nama_var_terkait: namaTerkait,
  });
}
