import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        workmeter: {
          ink: "#172033",
          steel: "#31445f",
          blue: "#0f5f9f",
          cyan: "#c7f4ff",
          orange: "#f27a1a",
          rust: "#7a1631",
          safety: "#ffb020",
          concrete: "#f4f6f8"
        }
      },
      boxShadow: {
        industrial: "0 18px 60px rgba(23, 32, 51, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
