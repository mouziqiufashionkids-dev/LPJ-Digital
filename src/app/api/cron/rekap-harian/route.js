import { getStats, getSettings, listTransaksi } from "@/lib/store";
import { kirimKeGrupWA } from "@/lib/notif-wa";

export const dynamic = "force-dynamic";

// Dipicu oleh Vercel Cron setiap hari jam 20:00 WIB (13:00 UTC)
// Mengirim rekap harian otomatis ke grup WA panitia
export async function GET() {
  try {
    const [stats, settings] = await Promise.all([getSettings(), getSettings()]);
    const st = await getStats();

    const hariIni = new Date().toLocaleDateString("id-CA", { timeZone: "Asia/Jakarta" });
    const garis = "=========================";
    const pesan = `*REKAP HARIAN — ${hariIni}*
${garis}
*Maulid Nabi \uFDFA 1448 H*
${settings.nama_masjid || "Masjid Al-Hikmah"}

MASUK: Rp ${(st.dana_masuk || 0).toLocaleString("id-ID")}
KELUAR: Rp ${(st.dana_keluar || 0).toLocaleString("id-ID")}
SISA: Rp ${(st.sisa || 0).toLocaleString("id-ID")}

PROGRESS: ${st.persen || 0}%
KK LUNAS: ${st.kk_lunas || 0}/${st.kk_total || 0}
TARGET: Rp ${(st.target_dana || 0).toLocaleString("id-ID")}

${garis}
Update realtime:
dkm-alhikmah.vercel.app

Dikirim otomatis jam 20.00 WIB
Panitia ${settings.nama_masjid || "Masjid Al-Hikmah"}`;

    const hasil = await kirimKeGrupWA(pesan);
    return Response.json({ ok: true, notifTerkirim: hasil.terkirim });
  } catch (e) {
    return Response.json({ ok: false, pesan: e.message }, { status: 500 });
  }
}
