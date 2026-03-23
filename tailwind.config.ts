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
        // Brand colors derived from Trash Pandas logos
        brand: {
          black:   "#0d0d0d",   // deep background
          surface: "#1a1a1a",   // card / panel surface
          border:  "#2a2a2a",   // subtle dividers
          hover:   "#252525",   // hover state for surfaces
          purple:  "#6B35A3",   // primary brand purple
          bright:  "#8B45C8",   // hover / accent purple
          light:   "#c4a0e8",   // light purple for text accents
          silver:  "#8a8a8a",   // raccoon gray / secondary text
          pale:    "#b8b8b8",   // lighter secondary text
          white:   "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"],
      },
      boxShadow: {
        purple: "0 0 20px rgba(107, 53, 163, 0.4)",
        "purple-lg": "0 0 40px rgba(107, 53, 163, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
