import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1117",
        panel: "#151B23",
        hairline: "#2A313C",
        paper: "#E8E6E0",
        signal: "#C9A227",
        risk: "#B3432B",
        stable: "#4C7A6E",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
