"use client";
import { useState } from "react";

export default function SaranForm() {
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [kirim, setKirim] = useState("idle"); // idle | kirim | sukses | gagal

  async function onSubmit(e) {
    e.preventDefault();
    if (pesan.trim().length < 3) return;
    setKirim("kirim");
    try {
      const r = await fetch("/api/saran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, pesan }),
      });
      if (!r.ok) throw new Error();
      setKirim("sukses");
      setNama("");
      setPesan("");
    } catch {
      setKirim("gagal");
    }
  }

  if (kirim === "sukses") {
    return (
      <div className="kartu p-6 text-center">
        <p className="text-3xl">🤲</p>
        <p className="font-semibold text-zamrud-800 mt-2">
          Jazakumullah khairan, saran Anda sudah masuk.
        </p>
        <p className="text-sm text-zamrud-900/60 mt-1">
          Saran akan tampil setelah dibaca panitia.
        </p>
        <button
          onClick={() => setKirim("idle")}
          className="mt-4 text-sm font-semibold text-zamrud-700 hover:underline"
        >
          Kirim saran lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="kartu p-6 space-y-4">
      <div>
        <label htmlFor="nama" className="block text-sm font-semibold text-zamrud-800 mb-1.5">
          Nama <span className="font-normal text-zamrud-900/50">(boleh dikosongkan / anonim)</span>
        </label>
        <input
          id="nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          maxLength={60}
          placeholder="Nama Anda (opsional)"
          className="w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="pesan" className="block text-sm font-semibold text-zamrud-800 mb-1.5">
          Saran / masukan
        </label>
        <textarea
          id="pesan"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          rows={4}
          maxLength={500}
          required
          placeholder="Tuliskan saran Anda untuk panitia kegiatan Maulid Nabi…"
          className="w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none"
        />
        <p className="text-xs text-zamrud-900/40 text-right">{pesan.length}/500</p>
      </div>
      {kirim === "gagal" && (
        <p className="text-sm text-rose-600">Gagal mengirim. Coba lagi sebentar…</p>
      )}
      <button
        type="submit"
        disabled={kirim === "kirim" || pesan.trim().length < 3}
        className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50 w-full"
      >
        {kirim === "kirim" ? "Mengirim…" : "Kirim Saran"}
      </button>
    </form>
  );
}
