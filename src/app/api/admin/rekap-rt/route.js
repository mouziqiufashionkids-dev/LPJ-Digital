import { listWarga, getStats } from "@/lib/store";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

// Rekap per RT: siapa sudah/belum bayar per RT
export async function GET() {
  const [warga, stats] = await Promise.all([listWarga(), getStats()]);

  const perRT = {};
  for (const w of warga) {
    const rt = w.rt || "Tanpa RT";
    if (!perRT[rt]) {
      perRT[rt] = { total: 0, lunas: 0, belum: 0, target: 0, terkumpul: 0, daftarBelum: [] };
    }
    perRT[rt].total++;
    perRT[rt].target += w.ancalah || 0;
    if (w.kupon?.status === "lunas") {
      perRT[rt].lunas++;
      perRT[rt].terkumpul += w.ancalah || 0;
    } else {
      perRT[rt].belum++;
      perRT[rt].daftarBelum.push({ nama: w.nama, ancalah: w.ancalah, kelas: w.kelas });
    }
  }

  return Response.json({
    stats,
    rekap: Object.entries(perRT).map(([rt, data]) => ({ rt, ...data })),
  });
}
