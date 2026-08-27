"use client";
import { useRouter } from "next/navigation";
import { hapusToken } from "@/lib/admin-auth";

export default function TombolLogout() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        try { await fetch("/api/admin/logout", { method: "POST" }); } catch {}
        hapusToken();
        router.replace("/");
      }}
      className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg px-3 py-2 transition"
    >
      Keluar
    </button>
  );
}
