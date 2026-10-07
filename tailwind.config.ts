import type { Config } from "tailwindcss";

// Mesmos tokens usados na prévia visual (ver alexia-camara-preview.jsx)
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF8F3",
        surface: "#F1ECE1",
        surfaceAlt: "#8EA66B",
        ink: "#22291F",
        inkSoft: "#5B6157",
        inkFaint: "#8A8F7F",
        primary: {
          DEFAULT: "#8EA66B",
          dark: "#2C4B3E",
          soft: "#DCE5DA",
        },
        
        accent: {
          DEFAULT: "#D8A2A2",
          soft: "#8EA66B",
        },
        attention: {
          DEFAULT: "#A94A3D",
          soft: "#F3DAD5",
        },
        line: "#DDD5C4",
      },
      fontFamily: {
        display: ['"Nunito"', "sans-serif"],
        sans: ['"Nunito"', "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
