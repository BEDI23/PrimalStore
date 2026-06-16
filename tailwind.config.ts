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
        // Orange du logo Primalstore — couleur de marque
        primary: {
          DEFAULT: "#ED4C20",
          dark: "#C53A14",
          light: "#FF6A42",
          50: "#FFF2ED",
          100: "#FFE1D5",
        },
        // Gris du logo — neutre secondaire
        graphite: {
          DEFAULT: "#6F6E73",
          dark: "#4A494E",
          light: "#9B9AA1",
          50: "#F4F4F5",
        },
        // Noir du logo — surfaces sombres
        ink: {
          DEFAULT: "#0B0B0C",
          soft: "#18181A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
