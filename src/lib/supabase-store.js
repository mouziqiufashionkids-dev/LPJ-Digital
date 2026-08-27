// ===================================================================
// PENYIMPANAN SUPABASE — dipakai otomatis saat env terisi.
// Skema tabel: lihat supabase/schema.sql
// ===================================================================
import { createClient } from "@supabase/supabase-js";

let _db = null;
function db() {
  if (!_db) {
    _db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return _db;
}

export async function getSettings() {
  const { data } = await db().from("pengaturan").select("*").eq("id", 1).single();
  return (
    data || {
      nama_kegiatan: "Maulid Nabi ﷺ",
      hijriah: "12 Rabiul Awal",
      penyelenggara: "Panitia",
      penyelenggara_singkat: "Panitia",
      lokasi_acara: "-",
      tanggal_acara: new Date().toISOString(),
      kontak_wa: "62",
    }
  );
}

export async function getStats() {
  const [{ data: w }, { data: t }, { data: kp }] = await Promise.all([
    db().from("warga").select("ancalah").eq("aktif", true),
    db().from("transaksi").select("tipe,jumlah"),
    db().from("kupon").select("status"),
  ]);
  const masuk = (t || []).filter((x) => x.tipe === "masuk").reduce((a, x) => a + x.jumlah, 0);
  const keluar = (t || []).filter((x) => x.tipe === "keluar").reduce((a, x) => a + x.jumlah, 0);
  const target = (w || []).reduce((a, x) => a + x.ancalah, 0);
  return {
    target_dana: target,
    dana_masuk: masuk,
    dana_keluar: keluar,
    sisa: masuk - keluar,
    persen: target ? Math.round((masuk / target) * 100) : 0,
    kk_total: (w || []).length,
    kk_lunas: (kp || []).filter((x) => x.status === "lunas").length,
    transaksi_masuk: (t || []).filter((x) => x.tipe === "masuk").length,
    transaksi_keluar: (t || []).filter((x) => x.tipe === "keluar").length,
    diperbarui: new Date().toLocaleString("id-ID", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
    }),
  };
}

export async function listWarga() {
  const { data } = await db()
    .from("warga")
    .select("*, kupon(*)")
    .eq("aktif", true)
    .order("nama");
  return data || [];
}

export async function cariWarga(q) {
  const norm = (q || "").trim().toLowerCase();
  if (norm.length < 2) return [];
  const { data } = await db()
    .from("warga")
    .select("id,nama,rt,ancalah,kupon(kode,status,tanggal_bayar)")
    .ilike("nama", `%${norm}%`)
    .limit(8);
  return (data || []).map((w) => ({
    id: w.id,
    nama: w.nama,
    rt: w.rt,
    nominal: w.ancalah,
    status: w.kupon?.status ?? "belum",
    tanggal_bayar: w.kupon?.tanggal_bayar ?? null,
    kode: w.kupon?.kode ?? null,
  }));
}

export async function tandaiLunas(wargaId, { tanggal, metode = "tunai", petugas = "Bendahara" } = {}) {
  const hari = tanggal || new Date().toISOString().slice(0, 10);
  const { data: k } = await db().from("kupon").select("*").eq("warga_id", wargaId).single();
  if (!k) return { ok: false, pesan: "Kupon tidak ditemukan" };
  if (k.status === "lunas") return { ok: false, pesan: "Kupon sudah lunas" };
  await db().from("kupon").update({ status: "lunas", tanggal_bayar: hari, metode, petugas }).eq("id", k.id);
  const { data: w } = await db().from("warga").select("*").eq("id", wargaId).single();
  await db().from("transaksi").insert({
    tanggal: hari, tipe: "masuk", jumlah: k.nominal,
    kategori: "Iuran Ancalah",
    keterangan: `Iuran Maulid Nabi · ${w?.nama ?? ""} (${w?.rt ?? ""}) · kupon ${k.kode}`,
    kupon_id: k.id,
  });
  return { ok: true };
}

export async function listTransaksi({ tipe } = {}) {
  let q = db().from("transaksi").select("*").order("tanggal", { ascending: false }).order("id", { ascending: false });
  if (tipe) q = q.eq("tipe", tipe);
  const { data } = await q;
  return data || [];
}

export async function tambahPengeluaran({ tanggal, jumlah, kategori, keterangan, buktiUrl }) {
  await db().from("transaksi").insert({
    tanggal, tipe: "keluar", jumlah, kategori, keterangan, bukti_url: buktiUrl || null,
  });
  return { ok: true };
}

export async function kirimSaran({ nama, pesan }) {
  await db().from("kotak_saran").insert({ nama: nama?.trim() || null, pesan: pesan.trim() });
  return { ok: true };
}

export async function listSaran({ hanyaTampil = true } = {}) {
  let q = db().from("kotak_saran").select("*").order("created_at", { ascending: false });
  if (hanyaTampil) q = q.eq("tampil", true);
  const { data } = await q;
  return data || [];
}

export async function setSaranStatus(id, { tampil, ditindaklanjuti } = {}) {
  const patch = {};
  if (typeof tampil === "boolean") patch.tampil = tampil;
  if (typeof ditindaklanjuti === "boolean") patch.ditindaklanjuti = ditindaklanjuti;
  await db().from("kotak_saran").update(patch).eq("id", id);
  return { ok: true };
}
