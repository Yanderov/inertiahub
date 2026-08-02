import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: {
          DEFAULT: "#0a0a0a",
          subtle: "#111111",
          card: "#131313",
          elevated: "#181818",
          border: "#262626",
          borderHover: "#3f3f46",
        },
        brand: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#3f3f46",
          700: "#27272a",
          800: "#18181b",
          900: "#0a0a0a",
          accent: "#a1a1aa",
          glow: "#52525b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-fade": "glowFade 6s ease-in-out infinite alternate",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        glowFade: {
          "0%": { opacity: "0.4", transform: "scale(0.98)" },
          "100%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "hero-glow": "radial-gradient(600px circle at 50% 20%, rgba(255, 255, 255, 0.05), transparent 70%), radial-gradient(400px circle at 60% 30%, rgba(255, 255, 255, 0.04), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
