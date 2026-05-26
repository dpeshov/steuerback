import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1A1A2E",
          50: "#f0f0f5",
          100: "#d1d1e8",
          900: "#1A1A2E",
        },
        brand: {
          red: "#E63946",
          navy: "#1A1A2E",
          surface: "#F4F5F7",
          success: "#2DC653",
          warning: "#F4A261",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'card': '0 1px 12px rgba(0,0,0,0.06)',
        'card-md': '0 4px 24px rgba(0,0,0,0.08)',
        'glow-red': '0 8px 32px rgba(230,57,70,0.25)',
        'glow-navy': '0 8px 32px rgba(26,26,46,0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      screens: {
        'xs': '375px',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.28s cubic-bezier(0.32,0.72,0,1)',
        'fade-in':  'fade-in 0.2s ease',
      },
    },
  },
  plugins: [],
};
export default config;
