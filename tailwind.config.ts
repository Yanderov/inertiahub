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
        background: "#08090d",
        surface: {
          DEFAULT: "#0f1117",
          subtle: "#141822",
          card: "#12151e",
          elevated: "#181d29",
          border: "#1e2433",
          borderHover: "#2d374d",
        },
        brand: {
          50: "#eef8ff",
          100: "#d8f0ff",
          200: "#bae3ff",
          300: "#8aceff",
          400: "#53b0ff",
          500: "#278cff",
          600: "#0067f5",
          700: "#0051d1",
          800: "#0043aa",
          900: "#063b86",
          accent: "#00f0ff",
          glow: "#6366f1",
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
        "hero-glow": "radial-gradient(600px circle at 50% 20%, rgba(0, 240, 255, 0.12), transparent 70%), radial-gradient(400px circle at 60% 30%, rgba(99, 102, 241, 0.15), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
