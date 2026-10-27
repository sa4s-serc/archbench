// Reading, ranking and formatting metric values. Direction always comes from the
// results file's metric registry; nothing here assumes "higher is better".

export const DIRECTION_LABEL = {
  higher: "Higher is better",
  lower: "Lower is better",
  none: "Descriptive, not ranked",
};

export const DIRECTION_ARROW = { higher: "↑", lower: "↓", none: "" };

export const meanOf = (row, metric) => {
  const value = row.metrics?.[metric]?.mean;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export const stdOf = (row, metric) => {
  const value = row.metrics?.[metric]?.std;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

// Best first for ranked directions; descriptive metrics sort high to low.
// Rows without a value always go last.
export function sortByMetric(rows, metric, direction) {
  const sign = direction === "lower" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = meanOf(a, metric);
    const vb = meanOf(b, metric);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return sign * (va - vb);
  });
}

// Standard competition ranking (1, 2, 2, 4). Equal values share a rank.
// Returns [{ row, rank }]; rank is null for rows without a value or for
// descriptive metrics, which are never ranked.
export function rankByMetric(rows, metric, direction) {
  const sorted = sortByMetric(rows, metric, direction);
  let previous = null;
  let previousRank = 0;
  return sorted.map((row, index) => {
    const value = meanOf(row, metric);
    if (value === null || direction === "none") return { row, rank: null };
    const rank = value === previous ? previousRank : index + 1;
    previous = value;
    previousRank = rank;
    return { row, rank };
  });
}

const decimalsFor = (value, unit) => {
  const abs = Math.abs(value);
  switch (unit) {
    case "percent":
    case "minutes":
      return 1;
    case "usd":
    case "dB":
      return 2;
    case "radians":
      return 3;
    case "lines":
    case "count":
      return abs >= 100 ? 0 : 2;
    case "tokens":
      return 0;
    default:
      if (abs !== 0 && abs < 0.1) return 4;
      return 3;
  }
};

const UNIT_SUFFIX = { percent: "%", dB: " dB", radians: " rad", minutes: " min" };

export function formatNumber(value, unit, decimals = decimalsFor(value, unit)) {
  if (value === null || value === undefined) return "–";
  const text = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (unit === "usd") return `$${text}`;
  return text + (UNIT_SUFFIX[unit] ?? "");
}

// Formats a mean and its spread with the same precision, e.g. "0.861 ± 0.007".
export function formatWithStd(mean, std, unit) {
  if (mean === null) return { value: "–", std: null };
  const decimals = decimalsFor(mean, unit);
  return {
    value: formatNumber(mean, unit, decimals),
    std: std === null ? null : formatNumber(std, null, decimals),
  };
}

const PROMPT_LABELS = {
  zero_shot: "Zero-shot",
  one_shot: "One-shot",
  few_shot: "Few-shot",
  readme: "README",
};

export const humanize = (value) =>
  PROMPT_LABELS[value] ??
  String(value)
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

// A short label for a row's setup: "Few-shot", "SAD-extracted SAM", "Fine tuned".
export function setupLabel(row) {
  const { prompt_style: style, approach } = row.setup ?? {};
  const parts = [];
  if (style) parts.push(humanize(style));
  if (approach) parts.push(approach === "fine_tuned" ? "Fine-tuned" : approach);
  return parts.join(", ");
}
