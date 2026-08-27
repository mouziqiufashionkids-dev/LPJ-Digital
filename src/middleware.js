import { NextResponse } from "next/server";

// Pelindung panel panitia: /admin/* dan /api/admin/* wajib sandi.
// Token = SHA-256(sandi + garam) — disimpan sebagai cookie httpOnly.
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
  const sandi = process.env.ADMIN_PASSWORD || "alhikmah2026";
  const token = await tokenDari(sandi);
  const sah = req.cookies.get("admin_t")?.value === token;

  // login & logout bebas diakses
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    if (pathname === "/admin/login" && sah) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (sah) return NextResponse.next();

  // API ditolak dengan 401 (bukan redirect)
  if (pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ ok: false, pesan: "Harus login panitia" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
