"use client";
import { useRouter } from "next/navigation";

export default function TombolLogout() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/");
        router.refresh();
      }}
      className="text-xs font-semibold bg-krem/10 hover:bg-krem/20 text-krem rounded-lg px-3 py-2 transition"
    >
      Keluar
    </button>
  );
}
