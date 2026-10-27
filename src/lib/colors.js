// Chart colour helpers. Family colours are CSS variables (see index.css) so
// they switch with the theme; the rank ramp is computed per theme here.

// Fixed order: a family keeps its colour whatever else is on screen.
const FAMILY_ORDER = ["Qwen", "Llama", "Gemma", "Phi", "Mistral", "gpt-oss"];

export const familyColor = (family) => {
  const index = FAMILY_ORDER.indexOf(family);
  return index === -1 ? "var(--fam-other)" : `var(--fam-${index + 1})`;
};

export const familiesInUse = (families) => {
  const set = new Set(families);
  const known = FAMILY_ORDER.filter((f) => set.has(f));
  const hasOther = [...set].some((f) => !FAMILY_ORDER.includes(f));
  return hasOther ? [...known, "Other"] : known;
};

const ACCENT_HUE = 277;

const oklchToHex = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    rgb
      .map((x) => {
        const c = Math.max(0, Math.min(1, x));
        const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
        return Math.round(v * 255).toString(16).padStart(2, "0");
      })
      .join("")
  );
};

// Rank shading: one hue (the accent's), strongest for rank 1. The lightness
// range skips the middle band where neither dark nor light text reaches 4.5:1.
export function rankFill(rank, count, theme) {
  const t = count <= 1 ? 0 : (rank - 1) / (count - 1);
  if (theme === "dark") {
    const strong = t < 0.5;
    const L = strong ? 0.84 - (t / 0.5) * 0.16 : 0.5 - ((t - 0.5) / 0.5) * 0.24;
    const C = strong ? 0.12 : 0.09 - ((t - 0.5) / 0.5) * 0.05;
    return { bg: oklchToHex(L, C, ACCENT_HUE), fg: strong ? "#111214" : "#f2f3f5" };
  }
  const strong = t < 0.5;
  const L = strong ? 0.36 + (t / 0.5) * 0.16 : 0.7 + ((t - 0.5) / 0.5) * 0.26;
  const C = strong ? 0.17 - (t / 0.5) * 0.02 : 0.11 - ((t - 0.5) / 0.5) * 0.085;
  return { bg: oklchToHex(L, C, ACCENT_HUE), fg: strong ? "#ffffff" : "#111318" };
}

export const rankRamp = (theme, steps = 12) =>
  Array.from({ length: steps }, (_, i) => rankFill(i + 1, steps, theme).bg);
