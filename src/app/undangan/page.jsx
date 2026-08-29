import Link from "next/link";
import { getSettings, listAgenda, listRsvp, getRsvpStats, getKonten } from "@/lib/store";
import { hariTanggalID, jamID, tanggalSingkat } from "@/lib/format";
import { isi } from "@/lib/konten";
import Logo from "@/components/Logo";
import Countdown from "@/components/Countdown";
import LiveRefresh from "@/components/LiveRefresh";
import RsvpForm from "@/components/RsvpForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Undangan Maulid Nabi — Konfirmasi Kehadiran",
};

export default async function UndanganPage() {
  const [s, agenda, semua, stat, K] = await Promise.all([
    getSettings(),
    listAgenda(),
    listRsvp(),
    getRsvpStats(),
    getKonten(),
  ]);
  // daftar publik: hanya yang hadir / belum pasti (tanpa catatan pribadi)
  const calonTamu = semua.filter((r) => r.kehadiran !== "berhalangan");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* ============ KARTU UNDANGAN ============ */}
      <div className="kartu overflow-hidden border-2 border-emas/60">
        <div className="bg-zamrud-800 bg-ornamen text-krem px-4 sm:px-6 py-6 sm:py-10 text-center">
          <Logo className="h-20 w-20 mx-auto" />
          <p className="font-judul text-2xl text-emas-terang mt-5">﷽</p>
          <p className="text-[11px] tracking-[0.35em] uppercase text-emas-terang mt-3">
            Undangan
          </p>
          <h1 className="font-judul text-2xl sm:text-3xl md:text-4xl font-bold mt-2 leading-tight break-words">
            Peringatan {s.nama_kegiatan}
          </h1>
          <p className="text-krem/80 mt-2">
            diselenggarakan oleh <strong className="text-krem">{s.nama_masjid}</strong>
          </p>

          <div className="mt-6 inline-flex flex-col gap-2 bg-krem/10 border border-krem/15 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm">
            <p>📅 <strong>{hariTanggalID(s.tanggal_acara)}</strong> · {jamID(s.tanggal_acara)}</p>
            <p>🕌 {s.lokasi_acara}</p>
          </div>

          <div className="mt-5 flex justify-center">
            <Countdown target={s.tanggal_acara} />
          </div>
        </div>

        <div className="p-6 md:p-8 bg-krem/60">
          <p className="text-center text-zamrud-900/80 leading-relaxed max-w-xl mx-auto">
            {isi(K["undangan.teks"], s)}
          </p>
        </div>
      </div>

      {/* ============ RUNDOWN ============ */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-12 mb-4">
        🕌 Rundown Acara
      </h2>
      <div className="kartu divide-y divide-zamrud-100">
        {agenda.map((a) => (
          <div key={a.id} className="flex items-start gap-4 px-5 py-4">
            <span className="pill bg-zamrud-50 text-zamrud-700 border border-zamrud-100 shrink-0 tabular-nums">
              {a.waktu}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-zamrud-900">{a.judul}</p>
              {a.keterangan && (
                <p className="text-xs text-zamrud-900/60 mt-0.5">{a.keterangan}</p>
              )}
              {a.lokasi && (
                <p className="text-xs text-zamrud-900/50 mt-0.5">📍 {a.lokasi}</p>
              )}
            </div>
          </div>
        ))}
        {agenda.length === 0 && (
          <p className="px-5 py-6 text-sm text-zamrud-900/60">
            Rundown menyusul — pantau halaman ini.
          </p>
        )}
      </div>

      {/* ============ FORM RSVP ============ */}
      <h2 className="font-judul text-2xl font-bold text-zamrud-800 mt-12 mb-2">
        ✅ Konfirmasi Kehadiran
      </h2>
      <p className="text-sm text-zamrud-900/70 mb-4">
        Isi nama Anda dan jawab pertanyaan kehadiran — nama Anda akan langsung
        tampil di daftar <strong>calon tamu</strong> di bawah dan tercatat untuk
        panitia (perkiraan konsumsi &amp; tempat duduk).
      </p>
      <RsvpForm />

      {/* ============ CALON TAMU (LIVE) ============ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-12 mb-4">
        <h2 className="font-judul text-2xl font-bold text-zamrud-800">
          🤝 Calon Tamu
        </h2>
        <LiveRefresh />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="kartu p-4 text-center border-zamrud-200">
          <p className="text-2xl font-bold text-zamrud-700">{stat.hadir_tamu}</p>
          <p className="text-xs font-semibold text-zamrud-900/60 mt-0.5">
            tamu insya Allah hadir
          </p>
          <p className="text-[10px] text-zamrud-900/40">
            dari {stat.hadir_nama} konfirmasi
          </p>
        </div>
        <div className="kartu p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stat.belum_pasti_nama}</p>
          <p className="text-xs font-semibold text-zamrud-900/60 mt-0.5">
            belum pasti
          </p>
        </div>
        <div className="kartu p-4 text-center">
          <p className="text-2xl font-bold text-zamrud-900/50">{stat.berhalangan_nama}</p>
          <p className="text-xs font-semibold text-zamrud-900/60 mt-0.5">
            berhalangan
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {calonTamu.map((r) => (
          <div key={r.id} className={`kartu p-4 flex items-center gap-3 ${r.kehadiran === "hadir" ? "border-zamrud-200" : "border-amber-200"}`}>
            <span className={`h-11 w-11 rounded-full ${r.kehadiran === "hadir" ? "bg-zamrud-100 text-zamrud-700" : "bg-amber-100 text-amber-700"} font-bold text-sm flex items-center justify-center shrink-0`}>
              {r.nama.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zamrud-900 truncate text-sm">
                {r.nama}
              </p>
              <p className="text-[11px] text-zamrud-900/50">
                {r.rt ? `${r.rt} · ` : ""}{tanggalSingkat(r.created_at)}
              </p>
              {r.kehadiran === "hadir" && (
                <span className="text-[11px] font-bold text-zamrud-600">
                  membawa {r.jumlah_tamu} orang
                </span>
              )}
            </div>
            <span className={`text-xl shrink-0 ${r.kehadiran === "hadir" ? "" : "opacity-50"}`}>
              {r.kehadiran === "hadir" ? "🤝" : "🤔"}
            </span>
          </div>
        ))}
        {calonTamu.length === 0 && (
          <p className="kartu p-6 text-sm text-zamrud-900/60 sm:col-span-2 text-center">
            Belum ada konfirmasi. Jadilah yang pertama! 🤲
          </p>
        )}
      </div>
      <p className="text-xs text-zamrud-900/50 mt-3">
        Daftar diperbarui otomatis (live). Nama yang berhalangan tidak
        ditampilkan — hanya hitungannya. Ragu?{" "}
        <Link href="/kotak-saran" className="underline">
          Sampaikan lewat kotak saran
        </Link>
        .
      </p>
    </main>
  );
}
