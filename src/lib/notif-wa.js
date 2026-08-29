// ===================================================================
// NOTIFIKASI WHATSAPP KE GRUP — via Fonnte (gratis, buatan Indonesia)
// Setup (5 menit):
// 1. Daftar di fonnte.com (pakai nomor WA bendahara)
// 2. Scan QR code yang muncul di dashboard Fonnte
// 3. Salin API Token dari dashboard
// 4. Tambahkan nomor bot Fonnte ke grup WA panitia
// 5. Kirim pesan apa saja di grup -> cek dashboard Fonnte -> dapat Group ID
// 6. Isi token + group ID di Pengaturan Web
// ===================================================================

const FONNTE_URL = "https://api.fonnte.com/send";

async function bacaPengaturanNotif() {
  try {
    const { getKonten } = await import("./store");
    const K = await getKonten();
    return {
      token: String(K["notif.fonnte_token"] || "").trim(),
      target: String(K["notif.fonnte_target"] || "").trim(),
      aktif: Boolean(
        String(K["notif.fonnte_aktif"] || "").trim().toLowerCase() === "ya" &&
        String(K["notif.fonnte_token"] || "").trim() &&
        String(K["notif.fonnte_target"] || "").trim()
      ),
    };
  } catch {
    return { token: "", target: "", aktif: false };
  }
}

// Kirim pesan ke grup WA via Fonnte
export async function kirimKeGrupWA(pesan) {
  const cfg = await bacaPengaturanNotif();
  if (!cfg.aktif) return { terkirim: false, pesan: "belum aktif" };

  try {
    const r = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: cfg.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: cfg.target,
        message: pesan,
      }),
      cache: "no-store",
    });

    const data = await r.json().catch(() => ({}));
    return { terkirim: r.ok, detail: data };
  } catch (e) {
    return { terkirim: false, pesan: e.message };
  }
}

// Format pesan rekap kas untuk grup
export function formatNotifikasiTransaksi({ tipe, jumlah, keterangan, kategori, stats, namaMasjid }) {
  const ikon = tipe === "masuk" ? "💰 PEMASUKAN BARU" : "💸 PENGELUARAN BARU";
  const jumlahStr = `Rp ${(jumlah || 0).toLocaleString("id-ID")}`;
  const persen = stats?.persen || 0;
  const garis = "━━━━━━━━━━━━━━━━━━";

  return `${ikon}
${garis}
${keterangan || kategori || "-"}
${jumlahStr}

📊 REKAP TERKINI:
• Masuk: Rp ${(stats?.dana_masuk || 0).toLocaleString("id-ID")}
• Keluar: Rp ${(stats?.dana_keluar || 0).toLocaleString("id-ID")}
• Sisa: Rp ${(stats?.sisa || 0).toLocaleString("id-ID")}
• Progress: ${persen}% (target Rp ${(stats?.target_dana || 0).toLocaleString("id-ID")})
• KK Lunas: ${stats?.kk_lunas || 0}/${stats?.kk_total || 0}

${garis}
Update realtime: dkm-alhikmah.vercel.app
Dikirim otomatis oleh sistem
Panitia ${namaMasjid || "Masjid Al-Hikmah"}`;
}

// Format pesan kupon lunas
export function formatNotifikasiLunas({ nama, nominal, tanggal, stats, namaMasjid }) {
  const garis = "━━━━━━━━━━━━━━━━━━";
  return `✅ KUPON LUNAS
${garis}
👤 ${nama}
💵 Rp ${(nominal || 0).toLocaleString("id-ID")}
📅 ${tanggal}

📊 Rekap: ${stats?.kk_lunas || 0}/${stats?.kk_total || 0} KK lunas
Progress: ${stats?.persen || 0}%

${garis}
Update realtime: dkm-alhikmah.vercel.app
Dikirim otomatis oleh sistem
Panitia ${namaMasjid || "Masjid Al-Hikmah"}`;
}
