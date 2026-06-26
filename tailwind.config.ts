import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Tokens marque Primalstore (conservés) ──────────────────────────
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
        // Surfaces claires chaudes
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FAF7F5",
          subtle: "#F4F1EF",
        },
        // Thème de catégorie piloté par CSS vars
        cat: {
          primary: "var(--cat-primary)",
          hover: "var(--cat-hover)",
          accent: "var(--cat-accent)",
          on: "var(--cat-on)",
        },

        // ── Tokens shadcn (résolution HSL via CSS vars) ────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // primary existe déjà en tokens marque hex ci-dessus ;
        // les composants shadcn consommeront hsl(var(--primary)) = #ED4C20
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
