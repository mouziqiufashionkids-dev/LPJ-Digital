import { NextResponse } from "next/server";

// Pelindung API panitia (/api/admin/*) — wajib sandi.
// Menerima token lewat cookie ATAU header Authorization: Bearer.
// Halaman /admin sendiri digerbangi di sisi klien (lihat admin-auth.js),
// karena sebagian lingkungan (iframe sandbox) memblokir cookie —
// data panitia tetap aman: SEMUA data hanya keluar lewat API ini.
async function tokenDari(sandi) {
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${sandi}::lpj-masjid-alhikmah`)
  );
  return Array.from(new Uint8Array(data))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // login & logout bebas diakses
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const sandi = process.env.ADMIN_PASSWORD || "alhikmah2026";
  const token = await tokenDari(sandi);
  const cookie = req.cookies.get("admin_t")?.value;
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  // token juga bisa lewat parameter URL ?t=... — jalur paling andal
  // karena sebagian proxy menghapus header khusus
  const viaUrl = req.nextUrl.searchParams.get("t");

  if (cookie === token || bearer === token || viaUrl === token) {
    return NextResponse.next();
  }

  return new NextResponse(
    JSON.stringify({ ok: false, pesan: "Harus login panitia" }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
