import type { Config } from "tailwindcss";

// Mesmos tokens usados na prévia visual (ver alexia-camara-preview.jsx)
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF8F3",
        surface: "#F1ECE1",
        surfaceAlt: "#EBE6D9",
        ink: "#22291F",
        inkSoft: "#5B6157",
        inkFaint: "#8A8F7F",
        primary: {
          DEFAULT: "#3F6B58",
          dark: "#2C4B3E",
          soft: "#DCE5DA",
        },
        accent: {
          DEFAULT: "#B9812F",
          soft: "#F1E2C2",
        },
        attention: {
          DEFAULT: "#A94A3D",
          soft: "#F3DAD5",
        },
        line: "#DDD5C4",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
