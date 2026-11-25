// Assembles the one results document the site reads:
//   registry (tasks, metrics, tiers) + paper rows mapped from src/data
//   + in-house rows from src/data/inhouse-results.json when that file exists.
// The CLI writes inhouse-results.json with `archbench export`.
import registry from "../data/registry.json";
import paperModels from "../data/paperModels.json";
import { PAPER_SOURCES } from "../data/taskInfo";
import { mapPaperResults } from "./paperResults";

const inhouseFiles = import.meta.glob("../data/inhouse-results.json", { eager: true, import: "default" });
const inhouseFile = Object.values(inhouseFiles)[0] ?? null;

const paperRows = mapPaperResults(PAPER_SOURCES, registry.tasks);

export function buildDoc(inhouse) {
  const base = inhouse ?? registry;
  return {
    example: inhouse?.example === true,
    generatedAt: inhouse?.generated_at ?? null,
    tasks: base.tasks,
    metrics: base.metrics,
    tiers: base.tiers,
    models: { ...paperModels, ...(inhouse?.models ?? {}) },
    // Paper rows always come from the site's own data, so any the CLI file
    // carries are dropped to avoid listing a result twice.
    results: [...(inhouse?.results ?? []).filter((r) => r.source === "inhouse"), ...paperRows],
  };
}

export const defaultDoc = buildDoc(inhouseFile);

// Development only: `?data=example` swaps in the contract's fake fixture. The
// branch is removed from production builds, so the fixture never ships.
export async function loadExampleDoc() {
  if (import.meta.env.DEV) {
    const fixture = await import("../../fixtures/archbench-results.example.json");
    return buildDoc(fixture.default);
  }
  return null;
}

export const taskIds = (doc) => Object.keys(doc.tasks);

export const rowsFor = (doc, task, filter = {}) =>
  doc.results.filter(
    (r) =>
      r.task === task &&
      (filter.source === undefined || r.source === filter.source) &&
      (filter.variant === undefined || (r.setup?.variant ?? null) === filter.variant) &&
      (filter.prompt === undefined || (r.setup?.prompt_style ?? null) === filter.prompt),
  );

// Distinct setup values in a set of rows, in first-seen order.
export const distinct = (rows, pick) => [...new Set(rows.map(pick))];

export const variantOf = (r) => r.setup?.variant ?? null;
export const promptOf = (r) => r.setup?.prompt_style ?? null;

// Metrics of a task that have at least one value among the rows.
export const metricsWithData = (doc, task, rows) =>
  Object.entries(doc.metrics[task] ?? {})
    .filter(([key]) => rows.some((r) => typeof r.metrics?.[key]?.mean === "number"))
    .map(([key, info]) => ({ key, ...info }));

// The metric a view ranks by: the task's primary metric when it has data,
// otherwise the first rankable metric that does.
export function defaultMetric(doc, task, rows) {
  const available = metricsWithData(doc, task, rows);
  const primary = doc.tasks[task]?.primary_metric;
  return (
    available.find((m) => m.key === primary) ??
    available.find((m) => m.direction !== "none") ??
    available[0] ??
    null
  );
}

export const modelName = (doc, id) => doc.models[id]?.display_name ?? id;
