import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tge: {
          primary: "#111827",
          accent: "#0ea5e9",
          soft: "#f1f5f9"
        }
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      }
    },
  },
  plugins: [],
};
export default config;
