// Jadwal sholat harian — API gratis aladhan.com (metode 20 = Kemenag RI).
// Di-cache 6 jam; jika gagal (misal tanpa internet), kartu tidak tampil.
const NAMA_WAKTU = [
  ["Fajr", "Subuh"],
  ["Sunrise", "Terbit"],
  ["Dhuhr", "Dzuhur"],
  ["Asr", "Ashar"],
  ["Maghrib", "Maghrib"],
  ["Isha", "Isya"],
];

const BULAN_HIJRIAH = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

async function ambilJadwal(kota) {
  try {
    const r = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(kota)}&country=Indonesia&method=20`,
      { next: { revalidate: 21600 } } // cache 6 jam
    );
    if (!r.ok) return null;
    const d = await r.json();
    if (d.code !== 200 || !d.data?.timings) return null;
    return d.data;
  } catch {
    return null;
  }
}

export default async function JadwalSholat({ kota = "Garut" }) {
  const data = await ambilJadwal(kota);
  if (!data) return null; // tanpa internet / API gagal — kartu disembunyikan

  const hijri = data.date?.hijri;
  const tanggalHijriah = hijri
    ? `${hijri.day} ${BULAN_HIJRIAH[(hijri.month?.number || 1) - 1]} ${hijri.year} H`
    : null;

  // tandai waktu sholat berikutnya (zona WIB)
  const sekarang = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta",
  }).format(new Date());
  const [jamSkrg, menitSkrg] = sekarang.split(":").map(Number);
  const menitKini = jamSkrg * 60 + menitSkrg;

  return (
    <section className="mx-auto max-w-5xl px-4 mt-6">
      <div className="kartu p-5 bg-zamrud-800 border-zamrud-800 bg-ornamen">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-sm font-semibold text-emas-terang">
            🕋 Jadwal Sholat · {kota} (Kemenag RI)
          </p>
          {tanggalHijriah && (
            <p className="text-xs text-krem/60">{tanggalHijriah}</p>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          {NAMA_WAKTU.map(([kunci, label]) => {
            const jam = (data.timings[kunci] || "").slice(0, 5);
            const [j, m] = jam.split(":").map(Number);
            const berikut = Number.isFinite(j) && j * 60 + m > menitKini;
            return (
              <div
                key={kunci}
                className={`rounded-xl px-2 py-2.5 text-center ${
                  berikut
                    ? "bg-emas text-zamrud-900 font-bold"
                    : "bg-krem/10 text-krem"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wide opacity-70">
                  {label}
                </p>
                <p className="text-base tabular-nums">{jam || "–"}</p>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-krem/40 mt-3 text-right">
          Sumber: aladhan.com — diperbarui otomatis setiap 6 jam
        </p>
      </div>
    </section>
  );
}
