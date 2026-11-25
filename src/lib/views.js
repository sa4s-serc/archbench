// Shapes the results document into what each chart needs.
import { formatNumber, formatWithStd, meanOf, rankByMetric, stdOf } from "./metrics";
import { distinct, promptOf, rowsFor } from "./results";

export const inhouseRows = (doc) => doc.results.filter((r) => r.source === "inhouse");

// In-house tasks that have rows, in registry order.
export const inhouseTasks = (doc) =>
  Object.keys(doc.tasks).filter((t) => doc.tasks[t].inhouse && rowsFor(doc, t, { source: "inhouse" }).length > 0);

export const promptStyles = (rows) => distinct(rows, promptOf).filter((p) => p !== null);

export const defaultPrompt = (styles) => (styles.includes("zero_shot") ? "zero_shot" : styles[0] ?? null);

export const primaryMetric = (doc, task) => {
  const key = doc.tasks[task].primary_metric;
  return { key, ...doc.metrics[task][key] };
};

export const formatParams = (model) => {
  if (model?.params_b == null) return "–";
  const v = model.params_b;
  return `${v >= 10 ? Math.round(v * 10) / 10 : v}B`;
};

export const tierLabel = (doc, id) => doc.tiers.find((t) => t.id === id)?.label ?? null;

export function buildMatrix(doc, prompt, shortName) {
  const tasks = inhouseTasks(doc).map((id) => ({ id, name: shortName(id), metric: primaryMetric(doc, id) }));
  const byModel = new Map();
  for (const task of tasks) {
    const rows = rowsFor(doc, task.id, { source: "inhouse", prompt });
    const ranked = rankByMetric(rows, task.metric.key, task.metric.direction);
    const count = ranked.filter((r) => r.rank !== null).length;
    for (const { row, rank } of ranked) {
      if (!byModel.has(row.model_id)) byModel.set(row.model_id, {});
      byModel.get(row.model_id)[task.id] = { rank, value: meanOf(row, task.metric.key), count };
    }
  }
  const models = [...byModel.entries()].map(([id, cells]) => {
    const model = doc.models[id];
    const ranks = Object.values(cells).map((c) => c.rank).filter((r) => r !== null);
    return {
      id,
      name: model?.display_name ?? id,
      family: model?.family,
      params: formatParams(model),
      // Average rank needs a result on every core task; otherwise models
      // ranked on fewer (often easier or harder) tasks are not comparable.
      avgRank: ranks.length === tasks.length ? ranks.reduce((a, b) => a + b, 0) / ranks.length : Infinity,
      cells,
    };
  });
  models.sort((a, b) => a.avgRank - b.avgRank || a.name.localeCompare(b.name));
  return { tasks, models };
}

const seconds = (ms) => `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`;

export const SCATTER_AXES = {
  params: {
    label: "Total parameters, billions (log scale)",
    smaller: "smaller",
    tick: (v) => `${v}B`,
    value: (row, model) => model?.params_b ?? null,
    describe: (p) => `${p.paramsLabel} parameters`,
  },
  latency: {
    label: "Median latency per request, seconds (log scale)",
    smaller: "faster",
    tick: (v) => (v < 1 ? `${v * 1000} ms` : `${v} s`),
    value: (row) => (row.telemetry?.latency_ms_p50 != null ? row.telemetry.latency_ms_p50 / 1000 : null),
    describe: (p) => `median latency ${p.latencyLabel}`,
  },
};

export function scatterPoints(doc, task, prompt, axisKey) {
  const metric = primaryMetric(doc, task);
  const axis = SCATTER_AXES[axisKey];
  return rowsFor(doc, task, { source: "inhouse", prompt })
    .map((row) => {
      const model = doc.models[row.model_id];
      const x = axis.value(row, model);
      const y = meanOf(row, metric.key);
      if (x === null || y === null || x <= 0) return null;
      const shown = formatWithStd(y, stdOf(row, metric.key), metric.unit);
      const moe = model?.active_params_b != null && model.active_params_b !== model.params_b;
      const paramsLabel = moe ? `${formatParams(model)}, ${model.active_params_b}B active` : formatParams(model);
      const latencyLabel = row.telemetry?.latency_ms_p50 != null ? seconds(row.telemetry.latency_ms_p50) : "–";
      return {
        id: row.model_id,
        name: model?.display_name ?? row.model_id,
        family: model?.family,
        x,
        y,
        paramsLabel,
        latencyLabel,
        moe,
        rows: [
          [metric.display_name, shown.std ? `${shown.value} ± ${shown.std}` : shown.value],
          ["Parameters", paramsLabel],
          ["Latency p50", latencyLabel],
          ...(row.telemetry?.gpu_hours != null ? [["GPU-hours", formatNumber(row.telemetry.gpu_hours, null, 3)]] : []),
        ],
      };
    })
    .filter(Boolean);
}

// Compact model labels for tight chart space.
export const shortModelName = (name) =>
  String(name)
    .replace(" Instruct 2507", " 2507")
    .replace("DeepSeek-R1-0528 Qwen3 8B", "DeepSeek-R1 8B")
    .replace("Mistral Small 3.2 24B", "Mistral Small 3.2");
