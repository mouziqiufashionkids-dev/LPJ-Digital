"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ambilToken, fetchAdmin } from "@/lib/admin-auth";
import { KONTEN_DEFAULT } from "@/lib/konten";

// ubah ISO -> nilai datetime-local (zona Jakarta)
function keInputTanggal(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const bag = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const ambil = (t) => bag.find((x) => x.type === t)?.value || "00";
  return `${ambil("year")}-${ambil("month")}-${ambil("day")}T${ambil("hour")}:${ambil("minute")}`;
}

const KOLOM_IDENTITAS = [
  ["nama_masjid", "Nama masjid", "mis. Masjid Al-Hikmah"],
  ["nama_kegiatan", "Nama kegiatan", "mis. Maulid Nabi ﷺ 1448 H"],
  ["hijriah", "Label hijriah", "mis. Rabiul Awal 1448 H"],
  ["penyelenggara", "Penyelenggara lengkap", "mis. RT 03 · Desa ..."],
  ["penyelenggara_singkat", "Penyelenggara singkat", "mis. RT 03 · Desa ..."],
  ["lokasi_acara", "Lokasi acara", "mis. Balai Warga & Masjid ..."],
];

const KOLOM_KONTAK = [
  ["kontak_wa", "Nomor WA bendahara", "62xxxxxxxxxx (wajib mulai 62)"],
  ["kota_sholat", "Kota jadwal sholat", "mis. Garut"],
  ["rekening_bank", "Bank donasi", "mis. Bank BRI"],
  ["rekening_no", "Nomor rekening donasi", "mis. 1234-5678-9012"],
  ["rekening_atas_nama", "Atas nama rekening", "mis. Masjid Al-Hikmah"],
  ["qris_url", "Alamat gambar QRIS (opsional)", "kosongkan bila belum ada"],
];

export default function PengaturanPage() {
  const [p, setP] = useState(null); // pengaturan
  const [konten, setKonten] = useState(null); // teks
  const [agenda, setAgenda] = useState([]); // rundown
  const [proses, setProses] = useState(false);
  const [sukses, setSukses] = useState("");
  const [gagal, setGagal] = useState("");
  const [perluLogin, setPerluLogin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchAdmin("/api/admin/pengaturan");
        if (r.status === 401) {
          setPerluLogin(true);
          return;
        }
        const d = await r.json();
        setP(d.pengaturan);
        setKonten(d.konten);
        setAgenda(
          (d.agenda || []).map((a) => ({
            waktu: a.waktu || "",
            judul: a.judul || "",
            lokasi: a.lokasi || "",
            keterangan: a.keterangan || "",
          }))
        );
      } catch {
        setGagal("Gagal memuat pengaturan — muat ulang halaman.");
      }
    })();
  }, []);

  // ---- alat bantu rundown ----
  function ubahBaris(i, kolom, nilai) {
    setAgenda((d) => d.map((b, x) => (x === i ? { ...b, [kolom]: nilai } : b)));
  }
  function tambahBaris() {
    setAgenda((d) => [...d, { waktu: "", judul: "", lokasi: "", keterangan: "" }]);
  }
  function hapusBaris(i) {
    setAgenda((d) => d.filter((_, x) => x !== i));
  }
  function pindah(i, arah) {
    setAgenda((d) => {
      const j = i + arah;
      if (j < 0 || j >= d.length) return d;
      const baru = [...d];
      [baru[i], baru[j]] = [baru[j], baru[i]];
      return baru;
    });
  }

  const grupKonten = useMemo(() => {
    const grup = {};
    for (const [kunci, v] of Object.entries(KONTEN_DEFAULT)) {
      (grup[v.halaman] ||= []).push({ kunci, ...v });
    }
    return grup;
  }, []);

  async function simpan(e) {
    e.preventDefault();
    setProses(true);
    setSukses("");
    setGagal("");
    try {
      const r = await fetchAdmin("/api/admin/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengaturan: { ...p, tanggal_acara: p.tanggal_acara },
          konten,
          agenda,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Gagal menyimpan");
      setSukses("✓ Tersimpan — perubahan langsung tampil di seluruh halaman web.");
    } catch (err) {
      setGagal(err.message || "Gagal menyimpan");
    } finally {
      setProses(false);
    }
  }

  if (perluLogin) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="kartu p-6 text-center text-zamrud-900/70">
          Sesi berakhir — silakan masuk lagi lewat klik logo 3× lalu kembali ke sini.
        </p>
        <Link href="/admin" className="text-sm text-zamrud-700 hover:underline mt-4">
          ← Ke panel utama
        </Link>
      </main>
    );
  }

  if (!p || !konten) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-zamrud-900/60 animate-pulse">Memuat pengaturan…</p>
      </main>
    );
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none";

  const Kolom = ({ k, label, placeholder }) => (
    <div>
      <label className="block text-xs font-semibold text-zamrud-800 mb-1">{label}</label>
      <input
        className={inputCls}
        value={p[k] ?? ""}
        placeholder={placeholder}
        maxLength={200}
        onChange={(e) => setP({ ...p, [k]: e.target.value })}
      />
    </div>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin" className="text-sm font-semibold text-zamrud-600 hover:underline">
          ← Panel
        </Link>
        <h1 className="font-judul text-3xl font-bold text-zamrud-800">
          ⚙ Pengaturan Web
        </h1>
      </div>
      <p className="text-sm text-zamrud-900/70 mt-2">
        Semua identitas, kontak, rekening donasi, dan kalimat-kalimat di halaman
        web bisa disesuaikan sendiri oleh panitia — tanpa perlu programmer.
        Placeholder <code>{"{masjid}"}</code> / <code>{"{kegiatan}"}</code> terisi otomatis.
      </p>

      {/* Info notifikasi WA Grup via Fonnte */}
      <div className="kartu p-5 border-emas/50 bg-amber-50/70">
        <h3 className="font-judul text-lg font-bold text-zamrud-800">
          🔔 Notifikasi OTOMATIS ke Grup WA
        </h3>
        <p className="text-xs text-zamrud-900/70 mt-1">
          Setiap pemasukan/pengeluaran &amp; kupon lunas akan <strong>OTOMATIS
          terkirim ke grup WhatsApp</strong> panitia — tanpa perlu forward manual.
        </p>
        <div className="mt-3 text-xs bg-white rounded-xl p-4 border border-zamrud-100 space-y-2">
          <p className="font-bold text-zamrud-800 text-sm">Cara aktivasi (gratis, 5 menit):</p>
          <div className="space-y-1.5 pl-2">
            <p><b>1.</b> Buka <a href="https://fonnte.com" target="_blank" className="underline text-zamrud-700 font-semibold">fonnte.com</a> → Daftar (pakai nomor WA bendahara)</p>
            <p><b>2.</b> Di dashboard Fonnte → scan QR code dengan WhatsApp HP</p>
            <p><b>3.</b> Salin <b>Token</b> dari dashboard</p>
            <p><b>4.</b> Tambahkan nomor bot Fonnte ke <b>grup WA panitia</b></p>
            <p><b>5.</b> Kirim pesan apa saja di grup → buka dashboard Fonnte → salin <b>Group ID</b> (format: 1234567890@g.us)</p>
            <p><b>6.</b> Isi Token + Group ID di bawah → ubah "tidak" jadi "ya" → Simpan</p>
          </div>
          <div className="mt-2 pt-2 border-t border-zamrud-100">
            <p className="font-semibold text-zamrud-700">Hasilnya:</p>
            <p>💰 Catat pemasukan → <b>otomatis muncul di grup WA</b> dengan rekap lengkap ✅</p>
            <p>💸 Catat pengeluaran → <b>otomatis muncul di grup WA</b> ✅</p>
            <p>✅ Tandai kupon lunas → <b>otomatis muncul di grup WA</b> ✅</p>
          </div>
        </div>
      </div>

      <form onSubmit={simpan} className="mt-8 space-y-8">
        {/* rangkaian kegiatan (rundown) */}
        <section className="kartu p-5 md:p-6">
          <h2 className="font-judul text-xl font-bold text-zamrud-800">
            🕌 Rangkaian Kegiatan (Rundown)
          </h2>
          <p className="text-xs text-zamrud-900/60 mt-1">
            Susunan acara yang tampil di halaman Undangan &amp; Proposal.
            Gunakan ↑↓ untuk menggeser urutan. Baris tanpa judul otomatis
            dibuang saat disimpan.
          </p>
          <div className="space-y-3 mt-4">
            {agenda.map((b, i) => (
              <div key={i} className="rounded-xl border border-zamrud-100 bg-zamrud-50/40 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="w-28 px-3 py-2 rounded-lg border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none text-sm"
                    placeholder="08.00 WIB"
                    value={b.waktu}
                    maxLength={20}
                    onChange={(e) => ubahBaris(i, "waktu", e.target.value)}
                  />
                  <input
                    className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none text-sm font-semibold"
                    placeholder="Judul acara (mis. Marhaban & Maulid Ad-Diba'i)"
                    value={b.judul}
                    maxLength={100}
                    onChange={(e) => ubahBaris(i, "judul", e.target.value)}
                  />
                  <button type="button" onClick={() => pindah(i, -1)} title="Naik"
                    className="h-9 w-9 rounded-lg border border-zamrud-200 text-zamrud-700 hover:bg-zamrud-100">↑</button>
                  <button type="button" onClick={() => pindah(i, 1)} title="Turun"
                    className="h-9 w-9 rounded-lg border border-zamrud-200 text-zamrud-700 hover:bg-zamrud-100">↓</button>
                  <button type="button" onClick={() => hapusBaris(i)} title="Hapus baris"
                    className="h-9 w-9 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200">✕</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  <input
                    className="px-3 py-2 rounded-lg border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none text-sm"
                    placeholder="Lokasi (opsional, mis. Masjid)"
                    value={b.lokasi}
                    maxLength={100}
                    onChange={(e) => ubahBaris(i, "lokasi", e.target.value)}
                  />
                  <input
                    className="px-3 py-2 rounded-lg border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none text-sm"
                    placeholder="Keterangan (opsional, mis. dipimpin majelis taklim)"
                    value={b.keterangan}
                    maxLength={160}
                    onChange={(e) => ubahBaris(i, "keterangan", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={tambahBaris}
            className="tombol border-2 border-zamrud-600 text-zamrud-700 hover:bg-zamrud-50 text-xs px-4 py-2.5 mt-4"
          >
            + Tambah Acara
          </button>
        </section>

        {/* identitas & acara */}
        <section className="kartu p-5 md:p-6">
          <h2 className="font-judul text-xl font-bold text-zamrud-800">
            🕌 Identitas & Acara
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {KOLOM_IDENTITAS.map(([k, label, ph]) => (
              <Kolom key={k} k={k} label={label} placeholder={ph} />
            ))}
            <div>
              <label className="block text-xs font-semibold text-zamrud-800 mb-1">
                Tanggal & jam acara (WIB)
              </label>
              <input
                type="datetime-local"
                className={inputCls}
                value={keInputTanggal(p.tanggal_acara)}
                onChange={(e) => setP({ ...p, tanggal_acara: e.target.value ? new Date(e.target.value + ":00+07:00").toISOString() : p.tanggal_acara })}
              />
            </div>
          </div>
        </section>

        {/* kontak & donasi */}
        <section className="kartu p-5 md:p-6">
          <h2 className="font-judul text-xl font-bold text-zamrud-800">
            💬 Kontak & 💛 Donasi
          </h2>
          <p className="text-xs text-zamrud-900/60 mt-1">
            Nomor WA dipakai untuk tombol "Chat Panitia" di seluruh web & proposal
            sponsor. Rekening tampil di tombol Donasi proposal.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {KOLOM_KONTAK.map(([k, label, ph]) => (
              <Kolom key={k} k={k} label={label} placeholder={ph} />
            ))}
          </div>
        </section>

        {/* teks halaman */}
        <section className="kartu p-5 md:p-6">
          <h2 className="font-judul text-xl font-bold text-zamrud-800">
            ✏️ Kalimat-Kalimat Halaman
          </h2>
          <p className="text-xs text-zamrud-900/60 mt-1">
            Ubah kalimat yang kurang tepat sesuai bahasa panitia. Kosongkan lalu
            simpan untuk memakai teks bawaan? — teks bawaan sudah terisi di kolom;
            cukup edit langsung.
          </p>
          {Object.entries(grupKonten).map(([halaman, daftar]) => (
            <div key={halaman} className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emas-gelap">
                {halaman}
              </p>
              <div className="space-y-4 mt-2">
                {daftar.map((k) => (
                  <div key={k.kunci}>
                    <label className="block text-xs font-semibold text-zamrud-800 mb-1">
                      {k.label}
                    </label>
                    <textarea
                      className={inputCls + (k.jenis === "pendek" ? "" : " text-sm")}
                      rows={k.jenis === "pendek" ? 2 : k.jenis === "baris" ? 5 : 4}
                      maxLength={2000}
                      value={konten[k.kunci] ?? ""}
                      onChange={(e) => setKonten({ ...konten, [k.kunci]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {sukses && (
          <p className="text-sm font-semibold text-zamrud-700 bg-zamrud-50 border border-zamrud-200 rounded-xl px-4 py-3">
            {sukses}
          </p>
        )}
        {gagal && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {gagal}
          </p>
        )}

        <div className="sticky bottom-4 flex gap-3">
          <button
            type="submit"
            disabled={proses}
            className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50 shadow-kartu flex-1"
          >
            {proses ? "Menyimpan…" : "💾 Simpan Semua Pengaturan"}
          </button>
        </div>
      </form>
    </main>
  );
}
