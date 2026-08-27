import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function tokenDari(sandi) {
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${sandi}::lpj-masjid-alhikmah`)
  );
  return Array.from(new Uint8Array(data))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, pesan: "Format salah" }, { status: 400 });
  }
  const sandi = process.env.ADMIN_PASSWORD || "alhikmah2026";
  if (!body?.sandi || String(body.sandi) !== sandi) {
    return NextResponse.json({ ok: false, pesan: "Sandi salah" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_t", await tokenDari(sandi), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
