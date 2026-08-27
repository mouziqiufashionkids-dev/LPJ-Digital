/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        zamrud: {
          50: "#f0f9f4",
          100: "#dcefe4",
          200: "#b9dfc9",
          300: "#8cc9a8",
          400: "#57ab82",
          500: "#2f8d66",
          600: "#0B6E4F",
          700: "#095C41",
          800: "#074A34",
          900: "#053827",
        },
        emas: {
          DEFAULT: "#D4AF37",
          terang: "#E8CD6B",
          gelap: "#B8952B",
        },
        krem: "#FAF7EF",
      },
      fontFamily: {
        judul: ["var(--font-judul)", "Georgia", "serif"],
        isi: ["var(--font-isi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        kartu: "0 2px 14px rgba(5, 56, 39, 0.08)",
      },
    },
  },
  plugins: [],
};
