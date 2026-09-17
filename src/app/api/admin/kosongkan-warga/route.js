import { kosongkanWarga, listWarga } from "@/lib/store";

export const dynamic = "force-dynamic";

// Mulai ulang data warga: hapus SEMUA kupon + SEMUA warga.
// (Dilindungi middleware panitia.) Untuk dipakai saat import ulang
// Excel yang diperbaiki — anti-dobel akan menghalangi jika data lama masih ada.
// Menggunakan lapisan store — jalan juga di mode demo.
export async function POST() {
  const h = await kosongkanWarga();
  if (!h.ok) return Response.json({ ok: false, pesan: h.pesan, sisa_warga: null, sisa_kupon: null });

  // hitung ulang beberapa kali (antisipasi jeda baca)
  let sisaWarga = null;
  let sisaKupon = null;
  for (let i = 0; i < 3; i++) {
    const warga = await listWarga();
    sisaWarga = warga.length;
    sisaKupon = warga.filter((w) => w.kupon).length;
    if (sisaWarga === 0 && sisaKupon === 0) break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  return Response.json({
    ok: sisaWarga === 0 && sisaKupon === 0,
    pesan: h.pesan || null,
    sisa_warga: sisaWarga,
    sisa_kupon: sisaKupon,
  });
}
