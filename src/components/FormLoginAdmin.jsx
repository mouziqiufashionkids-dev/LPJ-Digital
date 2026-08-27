"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { simpanToken } from "@/lib/admin-auth";

export default function FormLoginAdmin({ petunjuk }) {
  const router = useRouter();
  const [sandi, setSandi] = useState("");
  const [proses, setProses] = useState(false);
  const [gagal, setGagal] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (!sandi) return;
    setProses(true);
    setGagal("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sandi }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.pesan || "Sandi salah");
      simpanToken(d.token);
      router.replace("/admin");
    } catch (err) {
      setGagal(err.message || "Gagal masuk");
      setProses(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="kartu p-8 w-full max-w-sm">
      <p className="text-center font-judul text-2xl text-emas-terang">﷽</p>
      <h1 className="font-judul text-2xl font-bold text-zamrud-800 text-center mt-2">
        Panel Panitia
      </h1>
      <p className="text-sm text-zamrud-900/60 text-center mt-1">
        Masuk dengan sandi panitia
      </p>

      <label className="block text-sm font-semibold text-zamrud-800 mt-6 mb-1.5">
        Sandi
      </label>
      <input
        type="password"
        value={sandi}
        onChange={(e) => setSandi(e.target.value)}
        placeholder="Sandi panitia"
        autoFocus
        className="w-full px-4 py-3 rounded-xl border-2 border-zamrud-200 focus:border-zamrud-600 focus:outline-none"
      />
      {gagal && <p className="text-sm text-rose-600 mt-2">{gagal}</p>}
      <button
        type="submit"
        disabled={proses || !sandi}
        className="tombol bg-zamrud-600 text-white hover:bg-zamrud-700 disabled:opacity-50 w-full mt-4"
      >
        {proses ? "Memeriksa…" : "Masuk"}
      </button>

      {petunjuk && (
        <p className="text-xs text-zamrud-900/50 text-center mt-4">{petunjuk}</p>
      )}
    </form>
  );
}
