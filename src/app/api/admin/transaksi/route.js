import { tambahTransaksi, ubahTransaksi, simpanBerkas, getStats, getSettings } from "@/lib/store";
import { kirimNotifikasiWA, formatNotifikasiTransaksi } from "@/lib/notif-wa";

export const dynamic = "force-dynamic";

const MAKS_BERKAS = 4 * 1024 * 1024; // 4 MB
const TIPE_OK = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }

  const tipe = form.get("tipe") === "masuk" ? "masuk" : "keluar";
  const tanggal = String(form.get("tanggal") || "").slice(0, 10) ||
    new Date().toISOString().slice(0, 10);
  const jumlah = Number(String(form.get("jumlah") || "").replace(/[^0-9]/g, ""));
  const kategori = String(form.get("kategori") || "Lainnya").slice(0, 40);
  const keterangan = String(form.get("keterangan") || "").trim().slice(0, 160);

  if (!jumlah || jumlah <= 0) {
    return Response.json({ ok: false, pesan: "Jumlah harus diisi" }, { status: 400 });
  }
  if (!keterangan) {
    return Response.json({ ok: false, pesan: "Keterangan wajib diisi" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return Response.json({ ok: false, pesan: "Tanggal tidak valid" }, { status: 400 });
  }

  // unggah bukti (opsional; disarankan untuk pengeluaran)
  let buktiUrl = null;
  const berkas = form.get("bukti");
  if (berkas && typeof berkas === "object" && berkas.size > 0) {
    if (berkas.size > MAKS_BERKAS) {
      return Response.json(
        { ok: false, pesan: "Ukuran foto maksimal 4 MB" },
        { status: 400 }
      );
    }
    if (!TIPE_OK.includes(berkas.type)) {
      return Response.json(
        { ok: false, pesan: "Foto harus JPG, PNG, atau WebP" },
        { status: 400 }
      );
    }
    const ekst = berkas.type === "image/png" ? "png" : berkas.type === "image/webp" ? "webp" : "jpg";
    const nama = `${crypto.randomUUID()}.${ekst}`;
    const buffer = Buffer.from(await berkas.arrayBuffer());
    try {
      const hasil = await simpanBerkas(nama, buffer, berkas.type);
      buktiUrl = hasil.url;
    } catch (e) {
      return Response.json({ ok: false, pesan: e.message }, { status: 500 });
    }
  }

  const hasil = await tambahTransaksi({
    tanggal, tipe, jumlah, kategori, keterangan, buktiUrl,
  });

  // Kirim notifikasi WhatsApp otomatis (tidak blokir jika gagal)
  let notifTerkirim = false;
  if (hasil.ok) {
    try {
      const [stats, settings] = await Promise.all([getStats(), getSettings()]);
      const pesan = formatNotifikasiTransaksi({
        tipe, jumlah, keterangan, kategori, stats, namaMasjid: settings.nama_masjid,
      });
      const notif = await kirimNotifikasiWA(pesan);
      notifTerkirim = notif.terkirim;
    } catch {}
  }

  // Sertakan stats & nama untuk notifikasi grup
  let statsUntukNotif = null;
  let namaMasjid = null;
  if (hasil.ok) {
    try {
      const [st, set] = await Promise.all([getStats(), getSettings()]);
      statsUntukNotif = st;
      namaMasjid = set.nama_masjid;
    } catch {}
  }

  return Response.json(
    { ...hasil, buktiUrl, notifWA: notifTerkirim, stats: statsUntukNotif, namaMasjid },
    { status: hasil.ok ? 200 : 400 }
  );
}

// UBAH transaksi: perbaiki nominal/keterangan/tanggal/kategori
export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  if (!body?.id || !body?.data) {
    return Response.json({ ok: false, pesan: "id & data wajib" }, { status: 400 });
  }
  const hasil = await ubahTransaksi(body.id, body.data);
  return Response.json(hasil, { status: hasil.ok ? 200 : 400 });
}
