"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Login kini menyatu dengan /admin — alamat ini langsung dialihkan ke sana.
export default function LoginAdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-zamrud-900/60 animate-pulse text-center">
        Mengarahkan ke panel panitia…
      </p>
    </main>
  );
}
