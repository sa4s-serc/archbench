/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--page)",
        surface: "var(--surface)",
        control: "var(--control)",
        "control-active": "var(--control-active)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        grid: "var(--grid)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-tint": "var(--accent-tint)",
        "accent-on-tint": "var(--accent-on-tint)",
        tooltip: "var(--tooltip)",
        "tooltip-ink": "var(--tooltip-ink)",
        "tooltip-ink-2": "var(--tooltip-ink-2)",
      },
      boxShadow: {
        control: "var(--shadow-control)",
        pop: "var(--shadow-pop)",
      },
      maxWidth: {
        content: "1200px",
      },
      zIndex: {
        sticky: "20",
        menu: "30",
        dialog: "40",
        tooltip: "50",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  daisyui: {
    themes: ["light", "dark"],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
}
