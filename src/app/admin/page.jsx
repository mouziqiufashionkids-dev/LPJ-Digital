"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ambilToken, hapusToken } from "@/lib/admin-auth";
import { rupiah, tanggalSingkat } from "@/lib/format";
import AksiAdmin from "@/components/AksiAdmin";
import TambahWarga from "@/components/TambahWarga";
import TombolLogout from "@/components/TombolLogout";
import FormTransaksi from "@/components/FormTransaksi";
import FormDokumentasi from "@/components/FormDokumentasi";
import FormLoginAdmin from "@/components/FormLoginAdmin";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [galat, setGalat] = useState("");
  const [muat, setMuat] = useState(false);
  const [punyaToken, setPunyaToken] = useState(null); // null = sedang dicek

  const muatUlang = useCallback(async () => {
    setMuat(true);
    try {
      const r = await fetch("/api/admin/ikhtisar", {
        headers: { Authorization: `Bearer ${ambilToken() || ""}` },
        credentials: "include",
      });
      if (r.status === 401) {
        hapusToken();
        setPunyaToken(false);
        setData(null);
        return;
      }
      const d = await r.json();
      setData(d);
      setGalat("");
    } catch {
      setGalat("Gagal memuat data — periksa koneksi lalu muat ulang.");
    } finally {
      setMuat(false);
    }
  }, []);

  useEffect(() => {
    const ada = Boolean(ambilToken());
    setPunyaToken(ada);
    if (ada) muatUlang();
    const fn = () => muatUlang();
    window.addEventListener("lpj-admin-segar", fn);
    return () => window.removeEventListener("lpj-admin-segar", fn);
  }, [muatUlang]);

  // sedang memeriksa sesi
  if (punyaToken === null) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-zamrud-900/60 animate-pulse">Memeriksa sesi panitia…</p>
      </main>
    );
  }

  // belum login → tampilkan gerbang login
  if (!punyaToken) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-10">
        <FormLoginAdmin />
        <Link href="/" className="text-sm text-zamrud-700 hover:underline mt-6">
          ← Kembali ke halaman warga
        </Link>
      </main>
    );
  }

  if (galat && !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="kartu p-6 text-center text-rose-600">{galat}</p>
        <button onClick={muatUlang} className="tombol bg-zamrud-600 text-white mx-auto block mt-4">
          Muat Ulang
        </button>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-zamrud-900/60 animate-pulse">Memuat data panitia…</p>
      </main>
    );
  }

  const { stats: st, warga, transaksi, saran, rsvp, rsvpStat, dokumentasi, pengaturan: s } = data;
  const belumLunas = warga.filter((w) => w.kupon?.status !== "lunas").length;
  const saranBaru = saran.filter((x) => !x.tampil).length;
  const sponsor = warga.filter((w) => w.kelas === "sponsor");
  const labelKelas = (k) => (k === "sponsor" ? "Sponsor" : `K${k || "3"}`);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-judul text-3xl font-bold text-zamrud-800">
          🛠️ Panel Panitia
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={muatUlang}
            className="text-xs font-semibold bg-zamrud-50 text-zamrud-700 border border-zamrud-200 hover:bg-zamrud-100 rounded-lg px-3 py-2 transition"
          >
            {muat ? "Memuat…" : "↻ Muat Ulang"}
          </button>
          <TombolLogout />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zamrud-200 bg-zamrud-50 p-4 text-sm text-zamrud-900/80">
        <strong>Panel dilindungi sandi.</strong> Akses cepat: klik logo masjid 3×
        di halaman warga. Sesi 8 jam. {data.mode === "demo" && (
          <span className="text-zamrud-900/60">
            Mode demo aktif — sandi default{" "}
            <code>alhikmah2026</code> (ubah lewat ADMIN_PASSWORD).
          </span>
        )}
      </div>

      {/* ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          ["Masuk", rupiah(st.dana_masuk), "text-zamrud-700"],
          ["Keluar", rupiah(st.dana_keluar), "text-rose-600"],
          ["Sisa", rupiah(st.sisa), "text-emas-gelap"],
          ["KK belum lunas", `${belumLunas} KK`, "text-amber-700"],
        ].map(([label, nilai, warna]) => (
          <div key={label} className="kartu p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zamrud-900/50">
              {label}
            </p>
            <p className={`text-lg font-bold ${warna}`}>{nilai}</p>
          </div>
        ))}
      </div>

      {/* tambah warga + generate kupon */}
      <div className="mt-8">
        <TambahWarga />
      </div>

      {/* catat transaksi */}
      <div className="mt-8">
        <FormTransaksi />
      </div>

      {/* warga & kupon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-10 mb-3">
        <h2 className="font-judul text-2xl font-bold text-zamrud-800">
          🎟️ Warga & Kupon Ancalah
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/kupon?kelas=1" className="tombol bg-zamrud-50 text-zamrud-700 border border-zamrud-200 hover:bg-zamrud-100 text-xs px-3 py-2">
            🖨️ Kupon Kelas 1
          </Link>
          <Link href="/admin/kupon?kelas=2" className="tombol bg-zamrud-50 text-zamrud-700 border border-zamrud-200 hover:bg-zamrud-100 text-xs px-3 py-2">
            🖨️ Kelas 2
          </Link>
          <Link href="/admin/kupon?kelas=3" className="tombol bg-zamrud-50 text-zamrud-700 border border-zamrud-200 hover:bg-zamrud-100 text-xs px-3 py-2">
            🖨️ Kelas 3
          </Link>
          <Link href="/admin/kupon?kelas=sponsor" className="tombol bg-emas text-zamrud-900 hover:bg-emas-terang text-xs px-3 py-2">
            🖨️ Kupon Sponsor
          </Link>
        </div>
      </div>
      <div className="kartu overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zamrud-900/60 border-b border-zamrud-100">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">RT</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Alamat</th>
              <th className="px-4 py-3 font-semibold">Kelas</th>
              <th className="px-4 py-3 font-semibold">Ancalah</th>
              <th className="px-4 py-3 font-semibold">Kupon</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zamrud-50">
            {warga.map((w) => {
              const lunas = w.kupon?.status === "lunas";
              return (
                <tr key={w.id} className={lunas ? "bg-zamrud-50/40" : ""}>
                  <td className="px-4 py-2.5 font-medium text-zamrud-900">{w.nama}</td>
                  <td className="px-4 py-2.5 text-zamrud-900/60">{w.rt}</td>
                  <td className="px-4 py-2.5 text-zamrud-900/60 hidden md:table-cell">
                    {w.alamat || "-"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`pill ${w.kelas === "sponsor" ? "bg-amber-100 text-amber-700" : "bg-zamrud-50 text-zamrud-700 border border-zamrud-100"}`}>
                      {labelKelas(w.kelas)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{rupiah(w.ancalah)}</td>
                  <td className="px-4 py-2.5 text-zamrud-900/60 font-mono text-xs">
                    {w.kupon?.kode || "-"}
                  </td>
                  <td className="px-4 py-2.5">
                    {lunas ? (
                      <span className="pill bg-zamrud-100 text-zamrud-700">
                        ✓ Lunas{w.kupon.tanggal_bayar ? ` · ${tanggalSingkat(w.kupon.tanggal_bayar)}` : ""}
                      </span>
                    ) : (
                      <span className="pill bg-amber-100 text-amber-700">Belum</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {!lunas && (
                        <AksiAdmin
                          url="/api/admin/bayar"
                          body={{ wargaId: w.id }}
                          label="Lunaskan"
                        />
                      )}
                      <AksiAdmin
                        url="/api/admin/warga"
                        method="DELETE"
                        body={{ id: w.id }}
                        label="Hapus"
                        merah
                        tanya={`Hapus ${w.nama}? Kupon & catatan iurannya juga akan dihapus.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* sponsor: kirim proposal */}
      {sponsor.length > 0 && (
        <div className="mt-6 kartu p-5 border-emas/50 bg-amber-50/60">
          <h3 className="font-judul text-lg font-bold text-zamrud-800">
            💌 Kirim Proposal ke Sponsor ({sponsor.length})
          </h3>
          <p className="text-xs text-zamrud-900/70 mt-1">
            Proposal digital interaktif — dibuka lewat HP sponsor, ada CTA donasi
            (transfer/kas) & tombol hubungi panitia. Klik tombol WA di bawah,
            pesan sudah berisi tautan proposal atas nama sponsor tsb.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sponsor.map((w) => {
              const tautan = `${typeof window !== "undefined" ? window.location.origin : ""}/proposal?untuk=${encodeURIComponent(w.nama)}`;
              const pesan = encodeURIComponent(
                `Assalamu'alaikum ${w.nama}. Mohon izin, kami dari Panitia Maulid Nabi ${s.nama_masjid} ingin mengirimkan proposal dukungan kegiatan. Silakan dibuka lewat tautan berikut: ${tautan}. Jazakumullah khairan.`
              );
              return (
                <a
                  key={w.id}
                  href={`https://wa.me/?text=${pesan}`}
                  target="_blank"
                  rel="noreferrer"
                  className="pill bg-zamrud-600 text-white px-3 py-2 hover:bg-zamrud-700"
                >
                  💬 WA → {w.nama}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* transaksi terbaru */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-10 mb-3">
        💹 Transaksi Terbaru
      </h2>
      <div className="kartu divide-y divide-zamrud-100">
        {transaksi.slice(0, 8).map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span>{t.tipe === "masuk" ? "💰" : "💸"}</span>
            <span className="flex-1 min-w-0">
              <span className="font-medium text-zamrud-900">{t.keterangan}</span>
              <span className="block text-xs text-zamrud-900/50">
                {tanggalSingkat(t.tanggal)} · {t.kategori}
              </span>
            </span>
            <span className={t.tipe === "masuk" ? "font-semibold text-zamrud-600" : "font-semibold text-rose-600"}>
              {rupiah(t.jumlah)}
            </span>
          </div>
        ))}
      </div>

      {/* dokumentasi */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-10 mb-3">
        📷 Dokumentasi Kegiatan
      </h2>
      <FormDokumentasi />
      {dokumentasi.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {dokumentasi.map((d) => (
            <div key={d.id} className="kartu overflow-hidden">
              <img src={d.foto_url} alt={d.judul} className="w-full aspect-[4/3] object-cover" />
              <div className="p-2.5 flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-zamrud-900 leading-snug">
                  {d.judul}
                </p>
                <AksiAdmin
                  url="/api/admin/dokumentasi"
                  method="DELETE"
                  body={{ id: d.id }}
                  label="✕"
                  merah
                  tanya={`Hapus foto "${d.judul}"?`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* kotak saran */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-10 mb-3">
        📮 Kotak Saran
        {saranBaru > 0 && (
          <span className="ml-2 pill bg-amber-100 text-amber-700 align-middle">
            {saranBaru} baru
          </span>
        )}
      </h2>
      <div className="space-y-3">
        {saran.map((x) => (
          <div key={x.id} className="kartu p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zamrud-900">
                {x.nama || "Warga Anonim"}
                {!x.tampil && (
                  <span className="ml-2 pill bg-amber-100 text-amber-700">menunggu</span>
                )}
                {x.ditindaklanjuti && (
                  <span className="ml-2 pill bg-zamrud-100 text-zamrud-700">✅ ditindaklanjuti</span>
                )}
              </p>
              <p className="text-sm text-zamrud-900/80 mt-1">{x.pesan}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!x.tampil && (
                <AksiAdmin
                  url="/api/admin/saran"
                  body={{ id: x.id, tampil: true }}
                  label="Tampilkan"
                />
              )}
              {!x.ditindaklanjuti && (
                <AksiAdmin
                  url="/api/admin/saran"
                  body={{ id: x.id, ditindaklanjuti: true }}
                  label="Tandai Ditindaklanjuti"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RSVP */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-10 mb-3">
        🤝 Konfirmasi Kehadiran (Undangan)
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="kartu p-4 text-center">
          <p className="text-xl font-bold text-zamrud-700">{rsvpStat.hadir_tamu} tamu</p>
          <p className="text-xs text-zamrud-900/60">
            insya Allah hadir · {rsvpStat.hadir_nama} konfirmasi
          </p>
        </div>
        <div className="kartu p-4 text-center">
          <p className="text-xl font-bold text-amber-600">{rsvpStat.belum_pasti_nama}</p>
          <p className="text-xs text-zamrud-900/60">belum pasti</p>
        </div>
        <div className="kartu p-4 text-center">
          <p className="text-xl font-bold text-zamrud-900/50">{rsvpStat.berhalangan_nama}</p>
          <p className="text-xs text-zamrud-900/60">berhalangan</p>
        </div>
      </div>
      <div className="kartu overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zamrud-900/60 border-b border-zamrud-100">
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">RT</th>
              <th className="px-4 py-3 font-semibold">Kehadiran</th>
              <th className="px-4 py-3 font-semibold">Tamu</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Catatan</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zamrud-50">
            {rsvp.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-medium text-zamrud-900">{r.nama}</td>
                <td className="px-4 py-2.5 text-zamrud-900/60">{r.rt || "-"}</td>
                <td className="px-4 py-2.5">
                  {r.kehadiran === "hadir" && (
                    <span className="pill bg-zamrud-100 text-zamrud-700">✓ Hadir</span>
                  )}
                  {r.kehadiran === "belum_pasti" && (
                    <span className="pill bg-amber-100 text-amber-700">Belum pasti</span>
                  )}
                  {r.kehadiran === "berhalangan" && (
                    <span className="pill bg-zamrud-50 text-zamrud-900/50">Berhalangan</span>
                  )}
                </td>
                <td className="px-4 py-2.5">{r.jumlah_tamu || "-"}</td>
                <td className="px-4 py-2.5 text-zamrud-900/60 hidden md:table-cell max-w-[200px]">
                  {r.catatan || "-"}
                </td>
                <td className="px-4 py-2.5 text-zamrud-900/60">{tanggalSingkat(r.created_at)}</td>
                <td className="px-4 py-2.5">
                  <AksiAdmin
                    url="/api/admin/rsvp"
                    method="DELETE"
                    body={{ id: r.id }}
                    label="Hapus"
                    merah
                    tanya={`Hapus konfirmasi dari ${r.nama}?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
