const themes = require("daisyui/src/theming/themes");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      "light",
      {
        // daisyUI's dark theme with brighter text, visible borders and
        // cards one step lighter than the page, so everything reads clearly.
        dark: {
          ...themes.dark,
          primary: "oklch(70% 0.17 275.75)",
          "base-100": "#161a20",
          "base-200": "#1f252d",
          "base-300": "#36404c",
          "base-content": "#e4e8ee",
        },
      },
    ],
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
}
