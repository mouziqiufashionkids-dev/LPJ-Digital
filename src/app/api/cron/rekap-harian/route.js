import { getStats, getSettings } from "@/lib/store";
import { kirimKeGrupWA } from "@/lib/notif-wa";

export const dynamic = "force-dynamic";

// Dipicu oleh Vercel Cron setiap hari jam 20:00 WIB (13:00 UTC).
//   - SEBELUM 11 Sep 2026 : kirim rekap harian ke grup WA panitia
//   - TEPAT  11 Sep 2026  : kirim pesan penutup (terima kasih + laporan akhir)
//   - SETELAH 11 Sep 2026 : berhenti otomatis, tidak ada pesan yang dikirim
//
// Kirim manual pesan penutup kapan saja (khusus panitia):
//   /api/cron/rekap-harian?kirim=penutup&t=<token admin>

const TANGGAL_MAUDID = "2026-09-11"; // Maulid Nabi ﷺ 1448 H

function tanggalJakarta() {
  // en-CA menghasilkan format YYYY-MM-DD (aman untuk dibandingkan)
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

async function tokenAdmin() {
  const sandi = process.env.ADMIN_PASSWORD || "alhikmah2026";
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${sandi}::lpj-masjid-alhikmah`)
  );
  return Array.from(new Uint8Array(data))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function susunPesanPenutup() {
  const [st, settings] = await Promise.all([getStats(), getSettings()]);
  const nama = settings.nama_masjid || "Masjid Al-Hikmah";
  const garis = "=========================";
  const rp = (n) => `Rp ${(n || 0).toLocaleString("id-ID")}`;
  return `*PESAN PENUTUP — MAULID NABI \uFDFA 1448 H*
${garis}
${nama}

Alhamdulillah, kegiatan Maulid Nabi \uFDFA telah terlaksana dengan lancar atas izin Allah dan dukungan seluruh warga.

*LAPORAN AKHIR KAS*
MASUK: ${rp(st.dana_masuk)}
KELUAR: ${rp(st.dana_keluar)}
SISA: ${rp(st.sisa)}
${st.donasi_barang ? `DONASI BARANG: ${rp(st.donasi_barang)} (non-kas)\n` : ""}IURAN LUNAS: ${st.kk_lunas || 0}/${st.kk_total || 0} KK
TARGET: ${rp(st.target_dana)} (${st.persen || 0}%)

Laporan lengkap + bukti nota:
dkm-alhikmah.vercel.app/laporan

Jazakumullahu khairan kepada seluruh panitia, donatur, dan warga yang telah berpartisipasi. Semoga Allah membalas kebaikan kalian dengan balasan terbaik dan menjadikan amal kita diterima.

Barakallahu fiikum \uD83C\uDF19
Panitia ${nama}`;
}

async function susunRekapHarian(hariIni) {
  const [st, settings] = await Promise.all([getStats(), getSettings()]);
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
  return pesan;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // --- proteksi opsional: jika CRON_SECRET diisi di Vercel, wajib cocok ---
    const rahasia = process.env.CRON_SECRET;
    if (rahasia) {
      const otor = request.headers.get("authorization") || "";
      const bawaCron =
        otor === `Bearer ${rahasia}` || url.searchParams.get("kunci") === rahasia;
      if (!bawaCron) {
        const adminT = await tokenAdmin();
        if (url.searchParams.get("t") !== adminT) {
          return Response.json({ ok: false, pesan: "Tidak diizinkan" }, { status: 401 });
        }
      }
    }

    // --- kirim manual pesan penutup (khusus panitia, wajib token) ---
    if (url.searchParams.get("kirim") === "penutup") {
      const adminT = await tokenAdmin();
      if (url.searchParams.get("t") !== adminT) {
        return Response.json(
          { ok: false, pesan: "Perlu token panitia (?t=...)" },
          { status: 401 }
        );
      }
      const pesan = await susunPesanPenutup();
      const hasil = await kirimKeGrupWA(pesan);
      return Response.json({
        ok: hasil.terkirim,
        jenis: "penutup",
        notifTerkirim: hasil.terkirim,
        detail: hasil.detail || hasil.pesan || null,
      });
    }

    const hariIni = tanggalJakarta();

    // --- setelah acara selesai: berhenti otomatis, tidak kirim apa pun ---
    if (hariIni > TANGGAL_MAUDID) {
      return Response.json({
        ok: true,
        berhenti: true,
        pesan:
          "Maulid sudah selesai — rekap harian dihentikan otomatis. Cron job boleh dihapus dari Vercel dashboard (Settings → Cron Jobs).",
      });
    }

    // --- hari-H: pesan penutup (terima kasih + laporan akhir) ---
    if (hariIni === TANGGAL_MAUDID) {
      const pesan = await susunPesanPenutup();
      const hasil = await kirimKeGrupWA(pesan);
      return Response.json({
        ok: true,
        jenis: "penutup",
        notifTerkirim: hasil.terkirim,
      });
    }

    // --- sebelum hari-H: rekap harian biasa ---
    const pesan = await susunRekapHarian(hariIni);
    const hasil = await kirimKeGrupWA(pesan);
    return Response.json({ ok: true, jenis: "rekap", notifTerkirim: hasil.terkirim });
  } catch (e) {
    return Response.json({ ok: false, pesan: e.message }, { status: 500 });
  }
}
