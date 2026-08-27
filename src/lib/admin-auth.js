"use client";

// ============================================================
// AUTH PANEL PANITIA (tahan banting)
// Token disimpan berlapis: memori -> localStorage -> cookie.
// Beberapa lingkungan (iframe sandbox / privat) memblokir cookie
// dan localStorage — mode memori tetap bekerja selama halaman
// tidak di-refresh penuh. Token dikirim via header Authorization
// DAN cookie (mana yang diterima server).
// ============================================================

let memToken = null;

export function simpanToken(t) {
  memToken = t;
  try { localStorage.setItem("admin_t", t); } catch {}
  try {
    document.cookie = `admin_t=${t}; path=/; max-age=28800; samesite=lax`;
  } catch {}
}

export function ambilToken() {
  if (memToken) return memToken;
  try {
    const t = localStorage.getItem("admin_t");
    if (t) { memToken = t; return t; }
  } catch {}
  try {
    const m = document.cookie.match(/(?:^|;\s*)admin_t=([a-f0-9]{16,})/);
    if (m) { memToken = m[1]; return m[1]; }
  } catch {}
  return null;
}

export function hapusToken() {
  memToken = null;
  try { localStorage.removeItem("admin_t"); } catch {}
  try {
    document.cookie = "admin_t=; path=/; max-age=0";
  } catch {}
}

// fetch dengan token panitia otomatis terlampir
export async function fetchAdmin(url, opsi = {}) {
  const token = ambilToken();
  const headers = new Headers(opsi.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...opsi, headers, credentials: "include" });
}

// minta seluruh panel memuat ulang data setelah ada perubahan
export function segarkanPanel() {
  window.dispatchEvent(new CustomEvent("lpj-admin-segar"));
}
