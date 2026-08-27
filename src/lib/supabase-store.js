// ===================================================================
// PENYIMPANAN SUPABASE — dipakai otomatis saat env terisi.
// Skema tabel: lihat supabase/schema.sql
// ===================================================================
import { createClient } from "@supabase/supabase-js";
import { KONTEN_DEFAULT } from "./konten";

let _db = null;
// URL proyek Supabase — bisa dari env ATAU fallback di bawah
// (URL ini bukan rahasia: sudah tampil publik di link foto bukti).
export const SUPABASE_URL_FALLBACK = "https://zxyftqrufaxzdvfvqpfq.supabase.co";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL_FALLBACK;

function db() {
  if (!_db) {
    _db = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return _db;
}

// -------------------------------------------------------------------
// BANTUAN TAHAN-BANTING (diperbaiki 2026-08-27)
// Database produksi ternyata bisa beda tipis dari skema contoh:
//  - kolom `aktif` tidak ada / tidak terisi
//  - relasi kupon-warga tidak dikenali PostgREST (skema cache lama)
//  - kupon dikembalikan sebagai ARRAY (relasi 1-ke-banyak), padahal
//    kode lain mengharapkan SATU objek (atau null)
// Semua dibikin otomatis menyesuaikan di bawah, tanpa perlu mengubah
// database manual.
// -------------------------------------------------------------------

// PostgREST mengembalikan kupon sebagai array utk relasi ke-banyak.
// Kode lain (panel, halaman cetak, cek-iuran) mengharapkan satu objek.
function kuponTunggal(k) {
  if (Array.isArray(k)) return k.length ? k[0] : null;
  return k || null;
}

// Ambil baris warga: coba dengan filter `aktif` dulu; kalau kolomnya
// tidak ada di database, ulangi TANPA filter (data tetap muncul).
function ambilWarga(select) {
  // CATATAN: sengaja TANPA filter kolom `aktif` — di database produksi
  // kolom itu bisa NULL padahal barisnya valid (data hasil import).
  // Warga yang dihapus memang dihapus barisnya, jadi tidak perlu filter.
  return db().from("warga").select(select);
}

// Coba jalankan query; kalau gagal (kolom/relasi hilang), ulangi tanpa
// filter aktif. Mengembalikan { data, error } hasil terbaik.
async function cobaQueryWarga(select) {
  return ambilWarga(select);
}

// Lampirkan kupon ke daftar warga dengan query terpisah (dipakai saat
// relasi `kupon(*)` tidak dikenali database).
async function lampirkanKuponManual(daftar) {
  const ids = (daftar || []).map((w) => w.id);
  if (!ids.length) return [];
  const { data: kupons } = await db()
    .from("kupon")
    .select("warga_id,kode,status,tanggal_bayar,metode,petugas,nominal")
    .in("warga_id", ids);
  const peta = new Map((kupons || []).map((k) => [String(k.warga_id), k]));
  return (daftar || []).map((w) => ({
    ...w,
    kupon: peta.get(String(w.id)) || null,
  }));
}

export async function getSettings() {
  const { data } = await db().from("pengaturan").select("*").eq("id", 1).single();
  return (
    data || {
      nama_masjid: "Masjid Al-Hikmah",
      nama_kegiatan: "Maulid Nabi ﷺ",
      hijriah: "Rabiul Awal 1448 H",
      penyelenggara: "Panitia",
      penyelenggara_singkat: "Panitia",
      lokasi_acara: "-",
      tanggal_acara: new Date().toISOString(),
      kontak_wa: "62",
      kota_sholat: "Garut",
      rekening_bank: null,
      rekening_no: null,
      rekening_atas_nama: null,
      qris_url: null,
    }
  );
}

export async function getStats() {
  const [{ data: w }, { data: t }, { data: kp }] = await Promise.all([
    cobaQueryWarga("ancalah"),
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
  // Jalur 1: satu query dengan relasi kupon (paling cepat, skema lengkap)
  const r1 = await cobaQueryWarga("*, kupon(*)");
  if (!r1.error) {
    return (r1.data || []).map((w) => ({ ...w, kupon: kuponTunggal(w.kupon) }));
  }
  // Jalur 2: relasi tidak dikenali database -> dua query, digabung manual
  const r2 = await cobaQueryWarga("*");
  if (r2.error) return [];
  const daftar = await lampirkanKuponManual(r2.data || []);
  return daftar.sort((a, b) => String(a.nama || "").localeCompare(String(b.nama || ""), "id"));
}

export async function cariWarga(q) {
  const norm = (q || "").trim().toLowerCase();
  if (!norm) return [];
  // pencarian lewat kode kupon (dari QR kupon cetak)
  if (/^mld-?\d{1,6}$/i.test(norm)) {
    const kode = `MLD-${String(norm.replace(/^mld-?/i, "")).padStart(4, "0")}`;
    const { data: k, error } = await db()
      .from("kupon")
      .select("kode,status,tanggal_bayar,warga(id,nama,rt,ancalah)")
      .eq("kode", kode)
      .maybeSingle();
    if (!error && k?.warga) {
      return [{
        id: k.warga.id, nama: k.warga.nama, rt: k.warga.rt,
        nominal: k.warga.ancalah, status: k.status,
        tanggal_bayar: k.tanggal_bayar, kode: k.kode,
      }];
    }
    // jalur 2 (relasi tidak dikenali): dua query terpisah
    const k2 = await db()
      .from("kupon")
      .select("kode,status,tanggal_bayar,warga_id")
      .eq("kode", kode)
      .maybeSingle();
    if (k2.error || !k2.data?.warga_id) return [];
    const w2 = await db()
      .from("warga")
      .select("id,nama,rt,ancalah")
      .eq("id", k2.data.warga_id)
      .maybeSingle();
    if (w2.error || !w2.data) return [];
    return [{
      id: w2.data.id, nama: w2.data.nama, rt: w2.data.rt,
      nominal: w2.data.ancalah, status: k2.data.status,
      tanggal_bayar: k2.data.tanggal_bayar, kode: k2.data.kode,
    }];
  }
  if (norm.length < 2) return [];
  const { data, error } = await db()
    .from("warga")
    .select("id,nama,rt,ancalah,kupon(kode,status,tanggal_bayar)")
    .ilike("nama", `%${norm}%`)
    .limit(8);
  if (!error) {
    return (data || []).map((w) => {
      const k = kuponTunggal(w.kupon);
      return {
        id: w.id, nama: w.nama, rt: w.rt, nominal: w.ancalah,
        status: k?.status ?? "belum",
        tanggal_bayar: k?.tanggal_bayar ?? null,
        kode: k?.kode ?? null,
      };
    });
  }
  // jalur 2: query warga, lalu lampirkan kupon manual
  const w2 = await db()
    .from("warga")
    .select("id,nama,rt,ancalah")
    .ilike("nama", `%${norm}%`)
    .limit(8);
  if (w2.error) return [];
  const daftar = await lampirkanKuponManual(w2.data || []);
  return daftar.map((w) => ({
    id: w.id, nama: w.nama, rt: w.rt, nominal: w.ancalah,
    status: w.kupon?.status ?? "belum",
    tanggal_bayar: w.kupon?.tanggal_bayar ?? null,
    kode: w.kupon?.kode ?? null,
  }));
}

// tambah warga massal: kupon berkode unik dibuat otomatis.
// nama yang sudah terdaftar OTOMATIS DILEWATI (anti data dobel).
export async function tambahWargaBatch(rows) {
  const valid = (rows || []).filter((r) => r?.nama?.trim());
  if (!valid.length) return { ok: false, pesan: "Tidak ada baris valid" };
  const norm = (n) => String(n || "").toLowerCase().replace(/\s+/g, " ").trim();
  const { data: eksisting } = await db().from("warga").select("nama");
  const sudahAda = new Set((eksisting || []).map((w) => norm(w.nama)));
  const dobel = [];
  const bersih = [];
  for (const r of valid) {
    if (sudahAda.has(norm(r.nama))) {
      dobel.push(r.nama);
      continue;
    }
    sudahAda.add(norm(r.nama));
    bersih.push(r);
  }
  if (!bersih.length) {
    return { ok: true, ditambah: 0, kupon: [], dobel };
  }
  const { data: inserted, error } = await db()
    .from("warga")
    .insert(bersih.map((r) => ({
      nama: r.nama.trim().slice(0, 80),
      rt: r.rt || null,
      alamat: r.alamat || null,
      kelas: ["1", "2", "3", "sponsor"].includes(r.kelas) ? r.kelas : "3",
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
  // PENTING: cek hasil insert kupon — kalau gagal diam-diam, warga
  // masuk tapi kuponnya hilang (ini yang membuat halaman kupon kosong).
  const { error: errKupon } = await db().from("kupon").insert(kuponRows);
  let peringatan = null;
  if (errKupon) {
    // coba satu per satu — sebagian mungkin tetap bisa dibuat
    let berhasil = 0;
    for (const kr of kuponRows) {
      const satu = await db().from("kupon").insert(kr);
      if (!satu.error) berhasil++;
    }
    const gagal = kuponRows.length - berhasil;
    if (gagal > 0) {
      peringatan =
        `Warga berhasil ditambah, tapi ${gagal} kupon belum terbentuk ` +
        `(${errKupon.message}). Klik "Perbaiki kupon" di panel kupon.`;
    }
  }
  return {
    ok: true,
    ditambah: inserted.length,
    kupon: inserted.map((w, i) => ({ nama: w.nama, kode: kuponRows[i].kode, ancalah: w.ancalah })),
    dobel,
    peringatan,
  };
}

export async function hapusWarga(id) {
  // hapus kupon terkait dulu (aman walau tanpa relasi cascade di DB)
  await db().from("kupon").delete().eq("warga_id", id);
  await db().from("warga").delete().eq("id", id);
  return { ok: true };
}

export async function tandaiLunas(wargaId, { tanggal, metode = "tunai", petugas = "Bendahara" } = {}) {
  const hari = tanggal || new Date().toISOString().slice(0, 10);
  const { data: daftarK } = await db()
    .from("kupon")
    .select("*")
    .eq("warga_id", wargaId)
    .limit(1);
  let k = daftarK?.[0] || null;
  if (!k) {
    // perbaiki otomatis: kupon belum ada (gagal dibuat saat tambah warga)
    const w = await db().from("warga").select("id,nama,ancalah").eq("id", wargaId).maybeSingle();
    if (!w?.data) return { ok: false, pesan: "Warga tidak ditemukan" };
    const baru = await db()
      .from("kupon")
      .insert({
        warga_id: wargaId,
        kode: `MLD-${String(wargaId).padStart(4, "0")}`,
        nominal: w.data.ancalah,
        status: "belum",
      })
      .select();
    if (baru.error || !baru.data?.length) {
      return { ok: false, pesan: `Kupon tidak ditemukan (${baru.error?.message || "gagal dibuat"})` };
    }
    k = baru.data[0];
  }
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

// Perbaikan kupon: buatkan kupon utk setiap warga yg BELUM punya
// (mis. insert kupon sebelumnya gagal diam-diam). Aman diulang kapan pun.
export async function perbaikiKupon() {
  const r = await cobaQueryWarga("*");
  if (r.error || !r.data?.length) return { ok: true, dibuat: 0, kurang: 0 };
  const { data: kupons } = await db().from("kupon").select("warga_id");
  const punya = new Set((kupons || []).map((k) => String(k.warga_id)));
  const kurang = r.data.filter((w) => !punya.has(String(w.id)));
  let dibuat = 0;
  for (const w of kurang) {
    const { error } = await db().from("kupon").insert({
      warga_id: w.id,
      kode: `MLD-${String(w.id).padStart(4, "0")}`,
      nominal: w.ancalah || 0,
      status: "belum",
    });
    if (!error) dibuat++;
  }
  return { ok: true, dibuat, kurang: kurang.length - dibuat };
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
    url: `${SUPABASE_URL}/storage/v1/object/public/media/berkas/${namaFile}`,
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

// ------------------- PENGATURAN & TEKS ---------------------

export async function simpanPengaturan(patch = {}) {
  const boleh = [
    "nama_masjid", "nama_kegiatan", "hijriah", "penyelenggara",
    "penyelenggara_singkat", "lokasi_acara", "tanggal_acara",
    "kontak_wa", "kota_sholat", "rekening_bank", "rekening_no",
    "rekening_atas_nama", "qris_url",
  ];
  const bersih = {};
  for (const k of boleh) {
    if (patch[k] !== undefined) {
      bersih[k] = typeof patch[k] === "string" ? patch[k].slice(0, 200) : patch[k];
    }
  }
  if (Object.keys(bersih).length) {
    await db().from("pengaturan").update(bersih).eq("id", 1);
  }
  return { ok: true };
}

export async function simpanAgenda(daftar = []) {
  const bersih = (Array.isArray(daftar) ? daftar : [])
    .filter((a) => a && String(a.judul || "").trim())
    .slice(0, 50)
    .map((a) => ({
      waktu: String(a.waktu || "").trim().slice(0, 20) || null,
      judul: String(a.judul || "").trim().slice(0, 100),
      lokasi: String(a.lokasi || "").trim().slice(0, 100) || null,
      keterangan: String(a.keterangan || "").trim().slice(0, 160) || null,
    }));
  await db().from("agenda").delete().gt("id", 0);
  if (bersih.length) await db().from("agenda").insert(bersih);
  return { ok: true };
}

export async function getKonten() {
  const { data } = await db().from("konten").select("kunci,nilai");
  const hasil = {};
  for (const [k, v] of Object.entries(KONTEN_DEFAULT)) {
    hasil[k] = v.nilai;
  }
  for (const baris of data || []) {
    if (baris.kunci in hasil) hasil[baris.kunci] = baris.nilai;
  }
  return hasil;
}

export async function simpanKonten(ubah = {}) {
  const baris = Object.entries(ubah)
    .filter(([k]) => k in KONTEN_DEFAULT)
    .map(([k, v]) => ({ kunci: k, nilai: String(v ?? "").slice(0, 2000) }));
  if (baris.length) {
    await db().from("konten").upsert(baris, { onConflict: "kunci" });
  }
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
