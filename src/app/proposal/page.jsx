import Link from "next/link";
import { getSettings, getStats, listAgenda } from "@/lib/store";
import { rupiah, hariTanggalID, jamID } from "@/lib/format";
import Logo from "@/components/Logo";
import ProposalCta from "@/components/ProposalCta";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Proposal Sponsor — Maulid Nabi",
};

export default async function ProposalPage({ searchParams }) {
  const untuk = (searchParams?.untuk || "").trim().slice(0, 80) || null;
  const [s, st, agenda] = await Promise.all([getSettings(), getStats(), listAgenda()]);

  return (
    <main className="min-h-screen bg-krem pb-24">
      {/* ========== KEPALA PROPOSAL ========== */}
      <section className="bg-zamrud-800 bg-ornamen text-krem relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 pt-12 pb-14 text-center">
          <Logo className="h-20 w-20 mx-auto" />
          <p className="pill bg-krem/10 text-emas-terang mt-5">
            Proposal Dukungan Kegiatan
          </p>
          <h1 className="font-judul text-3xl md:text-4xl font-bold mt-3 leading-tight">
            Peringatan {s.nama_kegiatan}
          </h1>
          <p className="text-krem/80 mt-2">
            diselenggarakan oleh <strong className="text-krem">{s.nama_masjid}</strong>
          </p>
          <p className="text-sm text-krem/60 mt-1">
            {hariTanggalID(s.tanggal_acara)} · {jamID(s.tanggal_acara)} · {s.lokasi_acara}
          </p>

          {untuk && (
            <div className="mt-6 inline-block bg-emas text-zamrud-900 rounded-2xl px-6 py-3">
              <p className="text-[11px] uppercase tracking-widest opacity-70">Kepada Yth.</p>
              <p className="font-judul text-xl font-bold leading-tight">Bapak/Ibu {untuk}</p>
              <p className="text-xs mt-0.5 opacity-80">di tempat</p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        {/* ========== SALAM & LATAR BELAKANG ========== */}
        <section className="kartu p-6 md:p-8 -mt-8 relative z-10">
          <p className="text-right font-judul text-xl text-emas-gelap">﷽</p>
          <p className="text-sm leading-relaxed text-zamrud-900/85 mt-4">
            Assalamu&rsquo;alaikum warahmatullahi wabarakatuh{untuk ? `, Bapak/Ibu ${untuk}` : ""}.
            Puji syukur ke hadirat Allah ﷻ, dan shalawat bagi Nabi Muhammad ﷺ.
            Dalam rangka memperingati hari kelahiran Rasulullah ﷺ,{" "}
            <strong>{s.nama_masjid}</strong> bersama warga akan menyelenggarakan
            peringatan {s.nama_kegiatan} — kegiatan yang insya Allah menjadi
            sarana silaturahmi, syiar, dan pendidikan akhlak bagi anak-anak dan
            warga sekitar.
          </p>
          <p className="text-sm leading-relaxed text-zamrud-900/85 mt-3">
            Kegiatan ini sepenuhnya digotong bersama warga melalui iuran{" "}
            <em>ancalah</em>. Namun agar kegiatan berjalan lebih baik — konsumsi
            jamaah, hadiah anak-anak, santunan, dan perlengkapan acara — kami
            mengharapkan dukungan para <strong>dermawan</strong> seperti Anda.
            Sedikit atau banyak, insya Allah berlipat pahalanya.
          </p>
        </section>

        {/* ========== ANGKA TERBUKA ========== */}
        <section className="mt-6">
          <h2 className="font-judul text-2xl font-bold text-zamrud-800 mb-3">
            📊 Kondisi Dana Saat Ini — Terbuka untuk Anda
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="kartu p-4 text-center">
              <p className="text-xs font-semibold text-zamrud-900/60">TERKUMPUL</p>
              <p className="text-lg font-bold text-zamrud-700">{rupiah(st.dana_masuk)}</p>
            </div>
            <div className="kartu p-4 text-center">
              <p className="text-xs font-semibold text-zamrud-900/60">TERPAKAI</p>
              <p className="text-lg font-bold text-rose-600">{rupiah(st.dana_keluar)}</p>
            </div>
            <div className="kartu p-4 text-center">
              <p className="text-xs font-semibold text-zamrud-900/60">TARGET</p>
              <p className="text-lg font-bold text-emas-gelap">{rupiah(st.target_dana)}</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-zamrud-50 border border-zamrud-100 overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-zamrud-600 to-emas"
              style={{ width: `${Math.min(100, st.persen)}%` }}
            />
          </div>
          <p className="text-xs text-zamrud-900/60 mt-2">
            {st.persen}% tercapai — dan setiap rupiah laporannya bisa Anda cek
            langsung: <Link href="/laporan" className="underline font-semibold">lihat laporan kas terbuka</Link>{" "}
            ( transparansi penuh, bukan sekadar janji ).
          </p>
        </section>

        {/* ========== RUNDOWN ========== */}
        <section className="mt-8">
          <h2 className="font-judul text-2xl font-bold text-zamrud-800 mb-3">
            🕌 Rangkaian Kegiatan
          </h2>
          <div className="kartu divide-y divide-zamrud-100">
            {agenda.map((a) => (
              <div key={a.id} className="flex items-start gap-4 px-5 py-3.5">
                <span className="pill bg-zamrud-50 text-zamrud-700 border border-zamrud-100 shrink-0 tabular-nums">
                  {a.waktu}
                </span>
                <div>
                  <p className="font-semibold text-zamrud-900">{a.judul}</p>
                  {a.keterangan && (
                    <p className="text-xs text-zamrud-900/60">{a.keterangan}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== KEBUTUHAN ========== */}
        <section className="mt-8">
          <h2 className="font-judul text-2xl font-bold text-zamrud-800 mb-3">
            🤲 Titik yang Membutuhkan Dukungan
          </h2>
          <div className="kartu p-6 space-y-2.5 text-sm text-zamrud-900/85">
            <p>🍚 Konsumsi jamaah &amp; panitia (makan bersama ratusan warga)</p>
            <p>🎁 Hadiah perlombaan &amp; pengajian anak-anak</p>
            <p>🤲 Santunan anak yatim &amp; warga dhuafa</p>
            <p>🎪 Dekorasi, tenda, &amp; perlengkapan panggung</p>
            <p>📖 Kitab, mukena, &amp; keperluan majelis</p>
          </div>
          <p className="text-xs text-zamrud-900/60 mt-2">
            Boleh dukungan berupa dana maupun barang — semua dicatat amanah dan
            dilaporkan terbuka.
          </p>
        </section>

        {/* ========== KEISTIMEWAAN DUKUNGAN ========== */}
        <section className="mt-8 kartu p-6 bg-zamrud-50 border-zamrud-100">
          <h2 className="font-judul text-xl font-bold text-zamrud-800">
            ✨ Keistimewaan Mendukung Maulid Nabi ﷺ
          </h2>
          <p className="text-sm text-zamrud-900/80 mt-2 leading-relaxed">
            Rasulullah ﷺ bersabda: <em>&ldquo;Barangsiapa menghidupkan sunnahku
            yang telah mati di tengah umatku, maka baginya pahala seperti pahala
            seratus orang mati syahid.&rdquo;</em> Dukungan Anda ikut menghidupkan
            syiar Islam di kampung kami — dan nama Anda akan disebut dalam doa
            jamaah serta dicatat dalam laporan terbuka panitia.
          </p>
        </section>

        {/* ========== CTA ========== */}
        <section className="mt-10">
          <h2 className="font-judul text-2xl font-bold text-zamrud-800 mb-1">
            💛 Silihkan Pilih Sesuai Kemampuan &amp; Kesenangan Anda
          </h2>
          <p className="text-sm text-zamrud-900/70 mb-4">
            Satu ketukan jari — donasi bisa langsung saat ini juga.
          </p>
          <ProposalCta pengaturan={s} untuk={untuk} />
        </section>

        <p className="text-center text-xs text-zamrud-900/50 mt-10">
          Proposal digital resmi {s.nama_masjid} · {s.penyelenggara_singkat} ·
          hubungi bendahara:{" "}
          <a
            href={`https://wa.me/${s.kontak_wa}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            WhatsApp Panitia
          </a>
        </p>
        <div className="h-6" />
      </div>
    </main>
  );
}
