"use client";

// ============================================================
// AUTH PANEL PANITIA (tahan banting)
// Token disimpan berlapis:
//   1. memori (selama halaman terbuka)
//   2. localStorage + cookie (browser normal)
//   3. fallback terakhir: hash URL (#t=...) — bertahan walau
//      localStorage & cookie diblokir (mis. iframe sandbox),
//      termasuk setelah refresh penuh.
// Token dikirim ke server via header Authorization DAN cookie.
// ============================================================

let memToken = null;

export function simpanToken(t) {
  memToken = t;
  let tersimpan = false;
  try {
    localStorage.setItem("admin_t", t);
    tersimpan = true;
  } catch {}
  try {
    document.cookie = `admin_t=${t}; path=/; max-age=28800; samesite=lax`;
  } catch {}
  // lingkungan memblokir penyimpanan -> simpan di hash URL
  if (!tersimpan) {
    try {
      history.replaceState(null, "", `#t=${t}`);
    } catch {}
  }
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
  try {
    const h = location.hash.match(/#t=([a-f0-9]{16,})/);
    if (h) { memToken = h[1]; return h[1]; }
  } catch {}
  return null;
}

export function hapusToken() {
  memToken = null;
  try { localStorage.removeItem("admin_t"); } catch {}
  try { document.cookie = "admin_t=; path=/; max-age=0"; } catch {}
  try {
    if (location.hash.startsWith("#t=")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  } catch {}
}

// untuk info di layar login: bagaimana sesi disimpan
export function modePenyimpanan() {
  try { localStorage.setItem("__uji", "1"); localStorage.removeItem("__uji"); return "browser"; } catch {}
  try { document.cookie = "__uji=1"; if (document.cookie.includes("__uji")) { document.cookie = "__uji=; max-age=0"; return "cookie"; } } catch {}
  return "memori-url";
}

// fetch dengan token panitia otomatis terlampir
export async function fetchAdmin(url, opsi = {}) {
  const token = ambilToken();
  const headers = new Headers(opsi.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...opsi, headers, credentials: "include" });
}

// Perubahan kecil tampil SEKETIKA di layar (optimistic update) —
// panel tidak menunggu server untuk memperbarui tampilan.
export function patchPanel(detail) {
  window.dispatchEvent(new CustomEvent("lpj-admin-patch", { detail }));
}

// Muat ulang data penuh — DITUNDA 0,8 detik setelah aktivitas terakhir,
// agar klik cepat 2–10x hanya memicu SATU permintaan (anti-macet).
let timerSegar = null;
export function segarkanPanel() {
  try { clearTimeout(timerSegar); } catch {}
  timerSegar = setTimeout(() => {
    window.dispatchEvent(new CustomEvent("lpj-admin-segar"));
  }, 800);
}
