"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PILIHAN = [
  { id: "hadir", label: "Insya Allah Hadir", ikon: "🤝", ket: "Saya akan datang" },
  { id: "belum_pasti", label: "Belum Pasti", ikon: "🤔", ket: "Masih menimbang" },
  { id: "berhalangan", label: "Berhalangan", ikon: "📌", ket: "Tidak bisa hadir" },
];

export default function RsvpForm() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [rt, setRt] = useState("");
  const [pilih, setPilih] = useState(null);
  const [tamu, setTamu] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [proses, setProses] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [gagal, setGagal] = useState("");

  const inputCls =
    "w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none";

  async function onSubmit(e) {
    e.preventDefault();
    if (!pilih || nama.trim().length < 2) return;
    setProses(true);
    setGagal("");
    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama, rt, kehadiran: pilih,
          jumlah_tamu: tamu, catatan,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Gagal mengirim");
      setSukses(true);
      router.refresh(); // daftar calon tamu langsung ter-update
    } catch (err) {
      setGagal(err.message || "Gagal mengirim, coba lagi");
    } finally {
      setProses(false);
    }
  }

  if (sukses) {
    return (
      <div className="kartu p-6 text-center border-2 border-emas/50">
        <p className="text-4xl">🤲</p>
        <p className="font-judul text-xl font-bold text-zamrud-800 mt-2">
          Jazakumullah khairan, {nama.trim()}!
        </p>
        <p className="text-sm text-zamrud-900/70 mt-1">
          Konfirmasi Anda sudah tercatat. Nama Anda sudah tampil di daftar
          calon tamu di bawah — dan langsung terlihat panitia.
        </p>
        <button
          onClick={() => { setSukses(false); setNama(""); setRt(""); setPilih(null); setTamu(1); setCatatan(""); }}
          className="mt-4 text-sm font-semibold text-zamrud-700 hover:underline"
        >
          Konfirmasi untuk orang lain →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="kartu p-6 space-y-5">
      <div>
        <label className="block text-sm font-semibold text-zamrud-800 mb-1.5">
          Nama Anda <span className="text-rose-500">*</span>
        </label>
        <input
          className={inputCls}
          placeholder="Nama lengkap / nama keluarga"
          value={nama}
          maxLength={80}
          onChange={(e) => setNama(e.target.value)}
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-zamrud-800 mb-1.5">
            RT <span className="font-normal text-zamrud-900/50">(opsional)</span>
          </label>
          <input
            className={inputCls}
            placeholder="mis. RT 02"
            value={rt}
            maxLength={20}
            onChange={(e) => setRt(e.target.value)}
          />
        </div>
        {pilih && pilih !== "berhalangan" && (
          <div>
            <label className="block text-sm font-semibold text-zamrud-800 mb-1.5">
              Jumlah yang datang <span className="font-normal text-zamrud-900/50">(termasuk Anda)</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTamu((t) => Math.max(1, t - 1))}
                className="w-11 h-11 rounded-xl border-2 border-zamrud-200 text-lg font-bold text-zamrud-700 hover:bg-zamrud-50"
              >
                −
              </button>
              <span className="text-xl font-bold text-zamrud-800 w-8 text-center tabular-nums">
                {tamu}
              </span>
              <button
                type="button"
                onClick={() => setTamu((t) => Math.min(15, t + 1))}
                className="w-11 h-11 rounded-xl border-2 border-zamrud-200 text-lg font-bold text-zamrud-700 hover:bg-zamrud-50"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-zamrud-800 mb-2">
          Apakah Anda hadir? <span className="text-rose-500">*</span>
        </p>
        <div className="grid sm:grid-cols-3 gap-2.5">
          {PILIHAN.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPilih(p.id)}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                pilih === p.id
                  ? "border-zamrud-600 bg-zamrud-50 shadow-kartu"
                  : "border-zamrud-100 bg-white hover:border-zamrud-300"
              }`}
            >
              <span className="text-2xl">{p.ikon}</span>
              <p className="font-bold text-zamrud-900 text-sm mt-1">{p.label}</p>
              <p className="text-xs text-zamrud-900/60">{p.ket}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zamrud-800 mb-1.5">
          Catatan <span className="font-normal text-zamrud-900/50">(opsional — hanya dibaca panitia)</span>
        </label>
        <textarea
          className={inputCls}
          rows={2}
          maxLength={200}
          placeholder="mis. membawa anak-anak pengajian"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
        />
      </div>

      {gagal && <p className="text-sm text-rose-600">{gagal}</p>}

      <button
        type="submit"
        disabled={proses || !pilih || nama.trim().length < 2}
        className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50 w-full"
      >
        {proses ? "Mengirim…" : "Kirim Konfirmasi Kehadiran"}
      </button>
    </form>
  );
}
