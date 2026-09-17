import { getStats, getSettings } from "@/lib/store";
import { kirimKeGrupWA, alamatWeb } from "@/lib/notif-wa";

export const dynamic = "force-dynamic";

// Dipicu oleh Vercel Cron setiap hari jam 20:00 WIB (13:00 UTC).
// Tanggal acara diambil dari Pengaturan Web (kolom "tanggal acara"):
//   - SEBELUM hari-H  : kirim rekap harian ke grup WA panitia
//   - TEPAT hari-H    : kirim pesan penutup (terima kasih + laporan akhir)
//   - SETELAH hari-H  : berhenti otomatis, tidak ada pesan yang dikirim
//   - tanggal kosong  : rekap harian terus (belum ada hari-H yang ditentukan)
//
// Kirim manual pesan penutup kapan saja (khusus panitia, wajib token):
//   /api/cron/rekap-harian?kirim=penutup&t=<token admin>

function tanggalJakarta() {
  // en-CA menghasilkan format YYYY-MM-DD (aman untuk dibandingkan)
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function tanggalAcaraJakarta(settings) {
  if (!settings?.tanggal_acara) return null;
  const d = new Date(settings.tanggal_acara);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
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

async function susunPesanPenutup(settings) {
  const st = await getStats();
  const nama = settings.nama_masjid || "Masjid";
  const kegiatan = settings.nama_kegiatan || "Acara";
  const web = alamatWeb();
  const garis = "=========================";
  const rp = (n) => `Rp ${(n || 0).toLocaleString("id-ID")}`;
  return `*PESAN PENUTUP — ${kegiatan.toUpperCase()}*
${garis}
${nama}

Alhamdulillah, kegiatan ${kegiatan} telah terlaksana dengan lancar atas izin Allah dan dukungan seluruh warga.

*LAPORAN AKHIR KAS*
MASUK: ${rp(st.dana_masuk)}
KELUAR: ${rp(st.dana_keluar)}
SISA: ${rp(st.sisa)}
${st.donasi_barang ? `DONASI BARANG: ${rp(st.donasi_barang)} (non-kas)\n` : ""}IURAN LUNAS: ${st.kk_lunas || 0}/${st.kk_total || 0} KK
TARGET: ${rp(st.target_dana)} (${st.persen || 0}%)

Laporan lengkap + bukti nota:
${web ? `${web}/laporan` : "halaman Laporan web panitia"}

Jazakumullahu khairan kepada seluruh panitia, donatur, dan warga yang telah berpartisipasi. Semoga Allah membalas kebaikan kalian dengan balasan terbaik dan menjadikan amal kita diterima.

Barakallahu fiikum \uD83C\uDF19
Panitia ${nama}`;
}

async function susunRekapHarian(hariIni, settings) {
  const st = await getStats();
  const web = alamatWeb();
  const garis = "=========================";
  return `*REKAP HARIAN — ${hariIni}*
${garis}
*${settings.nama_kegiatan || "Kegiatan"}*
${settings.nama_masjid || "Masjid"}

MASUK: Rp ${(st.dana_masuk || 0).toLocaleString("id-ID")}
KELUAR: Rp ${(st.dana_keluar || 0).toLocaleString("id-ID")}
SISA: Rp ${(st.sisa || 0).toLocaleString("id-ID")}

PROGRESS: ${st.persen || 0}%
KK LUNAS: ${st.kk_lunas || 0}/${st.kk_total || 0}
TARGET: Rp ${(st.target_dana || 0).toLocaleString("id-ID")}

${garis}
Update realtime:
${web || "(alamat web belum diatur)"}

Dikirim otomatis jam 20.00 WIB
Panitia ${settings.nama_masjid || "Masjid"}`;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const settings = await getSettings();

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
      const pesan = await susunPesanPenutup(settings);
      // pratinjau: kembalikan isi pesan TANPA mengirim ke grup
      if (url.searchParams.get("pratinjau") === "1") {
        return Response.json({ ok: true, jenis: "pratinjau", pesan });
      }
      const hasil = await kirimKeGrupWA(pesan);
      return Response.json({
        ok: hasil.terkirim,
        jenis: "penutup",
        notifTerkirim: hasil.terkirim,
        detail: hasil.detail || hasil.pesan || null,
      });
    }

    const hariIni = tanggalJakarta();
    const tglAcara = tanggalAcaraJakarta(settings);

    // --- setelah acara selesai: berhenti otomatis, tidak kirim apa pun ---
    if (tglAcara && hariIni > tglAcara) {
      return Response.json({
        ok: true,
        berhenti: true,
        pesan:
          "Acara sudah selesai — rekap harian dihentikan otomatis. Cron job boleh dihapus dari Vercel dashboard (Settings → Cron Jobs).",
      });
    }

    // --- hari-H: pesan penutup (terima kasih + laporan akhir) ---
    if (tglAcara && hariIni === tglAcara) {
      const pesan = await susunPesanPenutup(settings);
      const hasil = await kirimKeGrupWA(pesan);
      return Response.json({
        ok: true,
        jenis: "penutup",
        notifTerkirim: hasil.terkirim,
      });
    }

    // --- sebelum hari-H (atau tanggal acara belum diisi): rekap harian biasa ---
    const pesan = await susunRekapHarian(hariIni, settings);
    const hasil = await kirimKeGrupWA(pesan);
    return Response.json({
      ok: true,
      jenis: "rekap",
      notifTerkirim: hasil.terkirim,
      tanggalAcara: tglAcara || "(belum diatur di Pengaturan Web)",
    });
  } catch (e) {
    return Response.json({ ok: false, pesan: e.message }, { status: 500 });
  }
}
