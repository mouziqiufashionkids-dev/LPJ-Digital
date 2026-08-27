export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#0B6E4F" />
      <path
        d="M26 8a13 13 0 1 0 0 24 10.5 10.5 0 1 1 0-24z"
        fill="#E8CD6B"
      />
      <path d="M29 12.5l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" fill="#E8CD6B" />
    </svg>
  );
}
