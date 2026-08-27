"use client";
import { useState } from "react";
import { fetchAdmin, patchPanel, segarkanPanel } from "@/lib/admin-auth";

// Tombol aksi panitia: optimistic update (layar langsung berubah),
// gagal bisa diulang tanpa logout, klik cepat bertubi-tubi aman.
export default function AksiAdmin({
  url,
  body,
  label,
  suksesLabel = "✓ Berhasil",
  method = "POST",
  tanya = null,
  merah = false,
  patch = null, // { jenis, ... } — perubahan lokal seketika
}) {
  const [proses, setProses] = useState(false);
  const [status, setStatus] = useState(null); // null | sukses | gagal
  const [pesanGagal, setPesanGagal] = useState("");

  async function jalankan() {
    if (tanya && !window.confirm(tanya)) return;
    setProses(true);
    setPesanGagal("");
    try {
      const r = await fetchAdmin(url, {
        method,
        headers: method === "DELETE" || body instanceof FormData ? undefined : { "Content-Type": "application/json" },
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.pesan || `Gagal (HTTP ${r.status})`);
      }
      setStatus("sukses");
      if (patch) patchPanel(patch);
      segarkanPanel();
    } catch (e) {
      setStatus("gagal");
      setPesanGagal(e.message || "Gagal");
    } finally {
      setProses(false);
    }
  }

  if (status === "sukses") {
    return <span className="text-xs font-semibold text-zamrud-600">{suksesLabel}</span>;
  }
  if (status === "gagal") {
    return (
      <button
        onClick={() => setStatus(null)}
        title={pesanGagal}
        className="text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg px-3 py-1.5"
      >
        ⚠ Gagal — ulangi
      </button>
    );
  }
  return (
    <button
      onClick={jalankan}
      disabled={proses}
      className={`text-xs font-semibold rounded-lg px-3 py-1.5 disabled:opacity-50 ${
        merah
          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
          : "bg-zamrud-600 text-white hover:bg-zamrud-700"
      }`}
    >
      {proses ? "…" : label}
    </button>
  );
}
