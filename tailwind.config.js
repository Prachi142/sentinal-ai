/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#030712",
          surface: "#0a0f1e",
          card: "rgba(15, 23, 42, 0.65)",
          border: "rgba(56, 189, 248, 0.25)",
          cyan: "#22d3ee",
          blue: "#38bdf8",
          green: "#34d399",
          purple: "#a78bfa",
          pink: "#f472b6",
          danger: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(56, 189, 248, 0.35)",
        "glow-green": "0 0 30px rgba(52, 211, 153, 0.35)",
        "glow-purple": "0 0 35px rgba(167, 139, 250, 0.35)",
      },
      animation: {
        scan: "scan 4s linear infinite",
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        blink: "blink 1.2s step-end infinite",
        grid: "gridMove 20s linear infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        gridMove: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 48px" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.07) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
