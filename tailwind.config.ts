import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "green-dark": "#243D2F",
        "green-mid": "#2D5240",
        "green-light": "#4A7C5F",
        "green-muted": "#7AAE8A",
        cream: "#F4EFE6",
        card: "#FAF7F2",
        "border-dashed": "#C8BFB0",
        "text-dark": "#1A2A1F",
        "text-mid": "#4A6355",
        "text-muted": "#8A9E90",
        "ate-bg": "#D4E8DA",
        "ate-text": "#1A4A2A",
        "partial-bg": "#F5EDD0",
        "partial-text": "#6B4F0A",
        "rejected-bg": "#F5D8D8",
        "rejected-text": "#6B1A1A",
        "idle-bg": "#EDE7DC",
        "idle-text": "#8A9E90",
        "accent-purple": "#6B5C8C",
        "accent-gold": "#E8A83A",
        "accent-olive": "#8A9070",
        background: "var(--background)",
        foreground: "var(--foreground)",
        "card-foreground": "var(--card-foreground)",
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
