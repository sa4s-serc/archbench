// Derived views over the in-house sweep: standings, picks, leaders, rank paths
// and per-tier bests. Everything ranks only within the in-house group.
import { formatNumber, meanOf, rankByMetric, stdOf } from "./metrics";
import { rowsFor } from "./results";
import { buildMatrix, inhouseTasks, primaryMetric } from "./views";

// One request of each task, median latency summed: a fair speed comparison
// because every model ran every task.
const latencySum = (doc, modelId, tasks, prompt) => {
  let total = 0;
  for (const task of tasks) {
    const row = rowsFor(doc, task.id, { source: "inhouse", prompt }).find((r) => r.model_id === modelId);
    const ms = row?.telemetry?.latency_ms_p50;
    if (ms == null) return null;
    total += ms;
  }
  return total / 1000;
};

// ArchBench Index: for each task, the share of the other ranked models this
// model beats (rank 1 of 26 = 100, last = 0), averaged over the tasks it was
// ranked on. A rescaled average rank that reads "higher is better".
export function indexOf(cells) {
  const parts = Object.values(cells)
    .filter((c) => c.rank != null && c.count > 1)
    .map((c) => (100 * (c.count - c.rank)) / (c.count - 1));
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
}

// Measured GPU energy per request, averaged over the tasks (watt-hours).
const energyPerRequest = (doc, modelId, tasks, prompt) => {
  const values = tasks
    .map((task) => rowsFor(doc, task.id, { source: "inhouse", prompt }).find((r) => r.model_id === modelId))
    .map((r) => (r?.telemetry?.energy_wh != null && r.completion?.total ? r.telemetry.energy_wh / r.completion.total : null))
    .filter((v) => v != null);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

// Overall standings: average rank across the in-house tasks (lower is better).
export function overallStandings(doc, prompt, shortName) {
  const matrix = buildMatrix(doc, prompt, shortName);
  const models = matrix.models
    .filter((m) => Number.isFinite(m.avgRank))
    .map((m) => {
      const model = doc.models[m.id];
      return {
        ...m,
        model,
        tier: model?.tier ?? null,
        paramsB: model?.params_b ?? null,
        activeB: model?.active_params_b ?? model?.params_b ?? null,
        seconds: latencySum(doc, m.id, matrix.tasks, prompt),
        tasksRanked: Object.values(m.cells).filter((c) => c.rank !== null).length,
        index: indexOf(m.cells),
        energy: energyPerRequest(doc, m.id, matrix.tasks, prompt),
      };
    });
  let previous = null;
  let previousPos = 0;
  models.forEach((m, i) => {
    m.position = m.avgRank === previous ? previousPos : i + 1;
    previous = m.avgRank;
    previousPos = m.position;
  });
  return { tasks: matrix.tasks, models };
}

// Ranked rows of one task with display fields.
export function taskStandings(doc, task, prompt) {
  const metric = primaryMetric(doc, task);
  const rows = rowsFor(doc, task, { source: "inhouse", prompt });
  return {
    metric,
    rows: rankByMetric(rows, metric.key, metric.direction)
      .filter((r) => r.rank !== null)
      .map(({ row, rank }) => {
        const model = doc.models[row.model_id];
        return {
          id: row.model_id,
          rank,
          row,
          model,
          name: model?.display_name ?? row.model_id,
          family: model?.family,
          tier: model?.tier ?? null,
          paramsB: model?.params_b ?? null,
          activeB: model?.active_params_b ?? model?.params_b ?? null,
          value: meanOf(row, metric.key),
          std: stdOf(row, metric.key),
          seconds: row.telemetry?.latency_ms_p50 != null ? row.telemetry.latency_ms_p50 / 1000 : null,
          label: formatNumber(meanOf(row, metric.key), metric.unit),
        };
      }),
  };
}

const fastestOf = (list) =>
  list.filter((m) => m.seconds != null).sort((a, b) => a.seconds - b.seconds)[0] ?? null;

// Three picks: best, best at 4B or less, fastest among the top five.
export function picksFrom(list) {
  if (!list.length) return null;
  const best = list[0];
  const tiny = list.find((m) => m.tier === "tiny") ?? null;
  const fastest = fastestOf(list.slice(0, 5));
  return { best, tiny, fastest };
}

// Best model in each size tier.
export function tierBests(doc, list) {
  return doc.tiers
    .map((tier) => ({ tier, best: list.find((m) => m.tier === tier.id) ?? null, count: list.filter((m) => m.tier === tier.id).length }))
    .filter((t) => t.count > 0);
}

// How far apart the models are on a task's primary metric, relative to the
// metric's range: a small spread means the metric barely separates models.
export function spreadOf(list, metric) {
  const values = list.map((m) => m.value).filter((v) => v != null);
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const range = metric.range ? metric.range[1] - metric.range[0] : hi;
  return { lo, hi, spread: hi - lo, relative: range ? (hi - lo) / range : null };
}

export const inhouseTaskList = (doc) => inhouseTasks(doc);

// One combined leaderboard for a task: every result on the task, filtered by
// prompt and setting, ranked by the chosen metric. Results with no prompt or
// setting recorded appear under every choice; a result with no setting counts
// as the task's default (first) setting.
export function taskEntries(doc, task, { prompt = null, variant = null, metricKey = null } = {}) {
  const all = rowsFor(doc, task);
  const variants = [...new Set(all.map((r) => r.setup?.variant).filter(Boolean))];
  const activeVariant = variant ?? variants[0] ?? null;
  const rows = all.filter((r) => {
    const p = r.setup?.prompt_style ?? null;
    const v = r.setup?.variant ?? variants[0] ?? null;
    return (!prompt || p === null || p === prompt) && (!activeVariant || v === activeVariant);
  });
  const key = metricKey ?? doc.tasks[task].primary_metric;
  const metric = { key, ...doc.metrics[task][key] };
  const ranked = rankByMetric(rows, key, metric.direction).filter((r) => r.rank !== null);
  return {
    metric,
    rows,
    variants,
    activeVariant,
    entries: ranked.map(({ row, rank }) => {
      const model = doc.models[row.model_id];
      const note = [row.setup?.approach && row.setup.approach !== "fine_tuned" ? row.setup.approach : null, row.setup?.approach === "fine_tuned" ? "fine-tuned" : null].filter(Boolean).join(", ");
      return {
        id: row.model_id,
        key: row.run_id,
        row,
        model,
        rank,
        name: model?.display_name ?? row.model_id,
        note,
        tier: model?.tier ?? null,
        value: meanOf(row, key),
        spread: stdOf(row, key),
        label: formatNumber(meanOf(row, key), metric.unit),
      };
    }),
  };
}
