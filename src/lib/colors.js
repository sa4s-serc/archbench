// Chart colour helpers. Family colours are CSS variables (see index.css) so
// they switch with the theme; the rank ramp is computed per theme here.

const FAMILY_VARS = {
  Qwen: "qwen",
  Llama: "llama",
  Gemma: "gemma",
  Phi: "phi",
  Mistral: "mistral",
  Granite: "granite",
  Nemotron: "nemotron",
  SmolLM: "smollm",
  OLMo: "olmo",
  Apertus: "apertus",
  DeepSeek: "deepseek",
  "gpt-oss": "gptoss",
};

export const FAMILY_ORDER = Object.keys(FAMILY_VARS);

export const familyColor = (family) => `var(--fam-${FAMILY_VARS[family] ?? "other"})`;

export const familiesInUse = (families) => {
  const set = new Set(families);
  const known = FAMILY_ORDER.filter((f) => set.has(f));
  const hasOther = [...set].some((f) => f && !FAMILY_VARS[f]);
  return hasOther ? [...known, "Other"] : known;
};

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

const lerp = (a, b, t) => a + (b - a) * t;

// Rank shading from the brand: marigold for rank 1, a lighter marigold for
// ranks 2 and 3, then navy steps that darken with rank. The hue stays on the
// navy side after the podium, so the ramp never passes through grey, khaki,
// green or teal; lightness carries the order on its own.
export function rankFill(rank, count, theme) {
  const light = theme === "light";
  if (rank === 1) return { bg: oklchToHex(light ? 0.84 : 0.84, 0.16, 82), fg: light ? "#0c1427" : "#141006" };
  if (rank <= 3) return { bg: oklchToHex(light ? 0.91 : 0.9, 0.09, 85), fg: light ? "#0c1427" : "#141006" };
  const t = count <= 4 ? 0 : (rank - 4) / (count - 4);
  if (light) return { bg: oklchToHex(lerp(0.86, 0.97, t), lerp(0.07, 0.015, t), 264), fg: "#0c1427" };
  // The band between L 0.52 and 0.64 is skipped: neither dark nor light text
  // reaches 4.5:1 there.
  const pale = t < 0.4;
  const L = pale ? lerp(0.8, 0.66, t / 0.4) : lerp(0.5, 0.29, (t - 0.4) / 0.6);
  const C = pale ? lerp(0.06, 0.09, t / 0.4) : lerp(0.11, 0.08, (t - 0.4) / 0.6);
  return { bg: oklchToHex(L, C, 264), fg: pale ? "#0b1631" : "#e9eef8" };
}

export const rankRamp = (theme, steps = 12) =>
  Array.from({ length: steps }, (_, i) => rankFill(i + 1, steps, theme).bg);
