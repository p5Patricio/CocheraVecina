import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#0F172A",
          950: "#080C1A",
          navy: {
            800: "#1E293B",
            900: "#0F172A",
            950: "#080C1A",
          },
          cobalt: {
            50: "#EFF6FF",
            500: "#3B82F6",
            600: "#2563EB",
            700: "#1D4ED8",
            900: "#1E3A8A",
          },
          amber: {
            500: "#F59E0B",
          },
          emerald: {
            600: "#10B981",
          },
        },
        surface: {
          canvas: "#FFFFFF",
          subtle: "#F8FAFC",
          elevated: "#FFFFFF",
        },
        border: {
          hairline: "#E2E8F0",
          subtle: "#F1F5F9",
          strong: "#CBD5E1",
        },
      },
    },
  },
  plugins: [],
};
export default config;
