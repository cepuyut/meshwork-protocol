import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        "ink-faint": "var(--ink-faint)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        blue: "var(--blue)",
                "blue-soft": "var(--blue-soft)",
                purple: "var(--purple)",
                "purple-soft": "var(--purple-soft)",
                sage: "var(--sage)",
        amber: "var(--amber)",
        green: "var(--green)",
        red: "var(--red)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
