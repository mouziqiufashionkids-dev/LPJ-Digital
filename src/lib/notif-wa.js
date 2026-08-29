// ===================================================================
// NOTIFIKASI WHATSAPP OTOMATIS via CallMeBot (gratis)
// Cara setup:
// 1. Tambahkan kontak +34 644 51 95 23 di HP
// 2. Kirim pesan: "I allow callmebot to send me messages"
// 3. Terima API key -> simpan di Pengaturan Web
// 4. Aktifkan notifikasi di Pengaturan Web
// ===================================================================

const CALLMEBOT_URL = "https://api.callmebot.com/whatsapp.php";

async function bacaPengaturanNotif() {
  try {
    const { getKonten } = await import("./store");
    const K = await getKonten();
    return {
      aktif: String(K["notif.wa_aktif"] || "").trim().toLowerCase() === "ya",
      nomor: String(K["notif.wa_nomor"] || "").replace(/[^0-9]/g, ""),
      apikey: String(K["notif.wa_apikey"] || "").trim(),
    };
  } catch {
    return { aktif: false, nomor: "", apikey: "" };
  }
}

export async function kirimNotifikasiWA(pesan) {
  const cfg = await bacaPengaturanNotif();
  if (!cfg.aktif || !cfg.nomor || !cfg.apikey) return { terkirim: false };
  try {
    const url = `${CALLMEBOT_URL}?phone=${cfg.nomor}&text=${encodeURIComponent(pesan)}&apikey=${cfg.apikey}`;
    const r = await fetch(url, { cache: "no-store" });
    return { terkirim: r.ok };
  } catch {
    return { terkirim: false };
  }
}

// Format pesan rekap kas otomatis
export function formatNotifikasiTransaksi({ tipe, jumlah, keterangan, kategori, stats, namaMasjid }) {
  const ikon = tipe === "masuk" ? "💰 PEMASUKAN BARU" : "💸 PENGELUARAN BARU";
  const jumlahStr = `Rp ${jumlah.toLocaleString("id-ID")}`;
  const persen = stats.persen || 0;
  const garis = "━━━━━━━━━━━━━━━━━━";
  
  return `${ikon}
${garis}
📝 ${keterangan || kategori || "-"}
💵 ${jumlahStr}

📊 REKAP TERKINI:
• Masuk: Rp ${(stats.dana_masuk || 0).toLocaleString("id-ID")}
• Keluar: Rp ${(stats.dana_keluar || 0).toLocaleString("id-ID")}
• Sisa: Rp ${(stats.sisa || 0).toLocaleString("id-ID")}
• Progress: ${persen}% (dari target Rp ${(stats.target_dana || 0).toLocaleString("id-ID")})
• KK Lunas: ${stats.kk_lunas || 0}/${stats.kk_total || 0}

${garis}
Dikirim otomatis oleh sistem
Panitia ${namaMasjid || "Masjid Al-Hikmah"}
Update realtime: dkm-alhikmah.vercel.app`;
}

// Format pesan kupon lunas
export function formatNotifikasiLunas({ nama, nominal, tanggal, stats, namaMasjid }) {
  const garis = "━━━━━━━━━━━━━━━━━━";
  return `✅ KUPON LUNAS
${garis}
👤 ${nama}
💵 Rp ${(nominal || 0).toLocaleString("id-ID")}
📅 ${tanggal}

📊 Rekap: ${stats.kk_lunas || 0}/${stats.kk_total || 0} KK lunas
Progress: ${stats.persen || 0}%

${garis}
Dikirim otomatis oleh sistem
Panitia ${namaMasjid || "Masjid Al-Hikmah"}`;
}
