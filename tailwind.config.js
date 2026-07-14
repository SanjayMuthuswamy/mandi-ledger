/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14201A",
        stone: {
          DEFAULT: "#E9EBDF",
          light: "#F8F9F3", // 6% lighter than base stone for elevated surfaces
        },
        turmeric: "#D9A02C",
        brass: "#8C6F3E",
        "ledger-red": "#A6362C",
        paddy: "#4C6B3F",
        variety: {
          ponni: "#F3EFE2",
          sona: "#B9723A",
          basmati: "#C9A227",
          idli: "#A85A3A",
          black: "#3E2A3E",
          brown: "#5B4530",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Archivo Black"', 'sans-serif'],
      },
      boxShadow: {
        'stamp': '1px 1px 0px 0px rgba(20, 32, 26, 0.1)',
      }
    },
  },
  plugins: [],
}
