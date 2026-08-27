// Logo asli masjid (public/logo-masjid.png) dalam lingkaran putih
// agar kontras di latar hijau tua.
export default function Logo({ className = "h-9 w-9" }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-full bg-white ring-2 ring-emas/50 p-[8%] shrink-0`}
    >
      <img
        src="/logo-masjid.png"
        alt="Logo masjid"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
