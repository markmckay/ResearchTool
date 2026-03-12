import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Source Sans 3'", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0f172a",
        surface: "#1e293b",
        border: "rgba(255,255,255,0.1)",
        accent: "#63b3ed",
        "accent-green": "#9acd82",
        muted: "#64748b",
        subtle: "#94a3b8",
        foreground: "#e2e8f0",
      },
    },
  },
  plugins: [],
};
export default config;
