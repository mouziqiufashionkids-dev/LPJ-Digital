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
  if (!norm) return [];
  // pencarian lewat kode kupon (dari QR kupon cetak)
  if (/^mld-?\d{1,6}$/i.test(norm)) {
    const kode = `MLD-${String(norm.replace(/^mld-?/i, "")).padStart(4, "0")}`;
    const { data: k } = await db()
      .from("kupon")
      .select("kode,status,tanggal_bayar,warga(id,nama,rt,ancalah)")
      .eq("kode", kode)
      .maybeSingle();
    if (!k?.warga) return [];
    return [{
      id: k.warga.id, nama: k.warga.nama, rt: k.warga.rt,
      nominal: k.warga.ancalah, status: k.status,
      tanggal_bayar: k.tanggal_bayar, kode: k.kode,
    }];
  }
  if (norm.length < 2) return [];
  const { data } = await db()
    .from("warga")
    .select("id,nama,rt,ancalah,kupon(kode,status,tanggal_bayar)")
    .ilike("nama", `%${norm}%`)
    .limit(8);
  return (data || []).map((w) => ({
    id: w.id, nama: w.nama, rt: w.rt, nominal: w.ancalah,
    status: w.kupon?.status ?? "belum",
    tanggal_bayar: w.kupon?.tanggal_bayar ?? null,
    kode: w.kupon?.kode ?? null,
  }));
}

// tambah warga massal: kupon berkode unik dibuat otomatis
export async function tambahWargaBatch(rows) {
  const valid = (rows || []).filter((r) => r?.nama?.trim());
  if (!valid.length) return { ok: false, pesan: "Tidak ada baris valid" };
  const { data: inserted, error } = await db()
    .from("warga")
    .insert(valid.map((r) => ({
      nama: r.nama.trim().slice(0, 80),
      rt: r.rt || null,
      alamat: r.alamat || null,
      ancalah: Number(r.ancalah) || 0,
    })))
    .select();
  if (error || !inserted?.length) {
    return { ok: false, pesan: error?.message || "Gagal menambah warga" };
  }
  const kuponRows = inserted.map((w) => ({
    warga_id: w.id,
    kode: `MLD-${String(w.id).padStart(4, "0")}`,
    nominal: w.ancalah,
    status: "belum",
  }));
  await db().from("kupon").insert(kuponRows);
  return {
    ok: true,
    ditambah: inserted.length,
    kupon: inserted.map((w, i) => ({ nama: w.nama, kode: kuponRows[i].kode, ancalah: w.ancalah })),
  };
}

export async function hapusWarga(id) {
  await db().from("warga").delete().eq("id", id);
  return { ok: true };
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

export async function tambahTransaksi({ tanggal, tipe, jumlah, kategori, keterangan, buktiUrl }) {
  await db().from("transaksi").insert({
    tanggal, tipe, jumlah, kategori, keterangan, bukti_url: buktiUrl || null,
  });
  return { ok: true };
}

// simpan berkas ke Supabase Storage (bucket publik "media")
export async function simpanBerkas(namaFile, buffer, tipeMime) {
  const { error } = await db()
    .storage.from("media")
    .upload(`berkas/${namaFile}`, buffer, { contentType: tipeMime, upsert: true });
  if (error) throw new Error(`Gagal mengunggah berkas: ${error.message}`);
  return {
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/berkas/${namaFile}`,
  };
}

// ----------------------- DOKUMENTASI -----------------------------

export async function listDokumentasi() {
  const { data } = await db().from("dokumentasi").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function tambahDokumentasi({ judul, fotoUrl }) {
  await db().from("dokumentasi").insert({ judul: judul?.trim() || "Kegiatan", foto_url: fotoUrl });
  return { ok: true };
}

export async function hapusDokumentasi(id) {
  await db().from("dokumentasi").delete().eq("id", id);
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

// --------------------- AGENDA & RSVP UNDANGAN ---------------------

export async function listAgenda() {
  const { data } = await db().from("agenda").select("*").order("id");
  return data || [];
}

export async function kirimRsvp({ nama, rt, kehadiran, jumlah_tamu, catatan }) {
  const { error } = await db().from("rsvp").insert({
    nama: nama.trim().slice(0, 80),
    rt: rt?.trim() || null,
    kehadiran,
    jumlah_tamu: kehadiran === "berhalangan" ? 0 : Math.max(1, Math.min(15, Number(jumlah_tamu) || 1)),
    catatan: catatan?.trim() || null,
  });
  if (error) return { ok: false, pesan: error.message };
  return { ok: true };
}

export async function listRsvp() {
  const { data } = await db().from("rsvp").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function getRsvpStats() {
  const { data } = await db().from("rsvp").select("kehadiran,jumlah_tamu");
  const r = data || [];
  const hadir = r.filter((x) => x.kehadiran === "hadir");
  const belum = r.filter((x) => x.kehadiran === "belum_pasti");
  const halang = r.filter((x) => x.kehadiran === "berhalangan");
  return {
    hadir_nama: hadir.length,
    hadir_tamu: hadir.reduce((a, x) => a + x.jumlah_tamu, 0),
    belum_pasti_nama: belum.length,
    belum_pasti_tamu: belum.reduce((a, x) => a + x.jumlah_tamu, 0),
    berhalangan_nama: halang.length,
  };
}

export async function hapusRsvp(id) {
  await db().from("rsvp").delete().eq("id", id);
  return { ok: true };
}
