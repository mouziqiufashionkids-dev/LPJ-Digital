"use client";
import { useEffect, useState } from "react";

export default function ToggleGelap() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const tersimpan = localStorage.getItem("mode-gelap") === "ya";
    setGelap(tersimpan);
    document.documentElement.classList.toggle("dark", tersimpan);
  }, []);

  function toggle() {
    const baru = !gelap;
    setGelap(baru);
    localStorage.setItem("mode-gelap", baru ? "ya" : "tidak");
    document.documentElement.classList.toggle("dark", baru);
  }

  return (
    <button
      onClick={toggle}
      className="text-lg px-2 py-1 rounded-lg hover:bg-zamrud-700/50 transition shrink-0"
      title={gelap ? "Mode terang" : "Mode gelap"}
    >
      {gelap ? "☀️" : "🌙"}
    </button>
  );
}
