import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        paper: "#f7f4ee",
        moss: "#61735f",
        clay: "#b85f46",
        steel: "#496b87",
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 32, 51, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
