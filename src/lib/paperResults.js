// Converts the hand-edited paper data (src/data/*Data.json) into result rows in
// the shape of the ArchBench results contract, so the site reads one format.
// The source files stay the place to edit paper numbers.

// Base names as written in the source files -> contract model ids.
const MODEL_IDS = {
  "GPT-4": "gpt-4",
  "GPT-4 Turbo": "gpt-4-turbo",
  "GPT-4o": "gpt-4o",
  "GPT-4o mini": "gpt-4o-mini",
  "GPT-4o-mini": "gpt-4o-mini",
  "GPT-3.5 Turbo": "gpt-3.5-turbo",
  "GPT-3.5-Turbo": "gpt-3.5-turbo",
  "GPT-3.5-davinci-003": "gpt-3.5-davinci-003",
  "Codex": "codex",
  "Claude 3.5 Sonnet": "claude-3.5-sonnet",
  "Claude Code": "claude-code",
  "DeepSeek-V3": "deepseek-v3",
  "DeepSeek-V2.5": "deepseek-v2.5",
  "DeepSeek-Coder-V2": "deepseek-coder-v2",
  "Artigenz-Coder-DS-6.7B": "artigenz-coder-ds-6.7b",
  "CodeQwen1.5-7B": "codeqwen-1.5-7b",
  "CodeQwen1.5-7B-Chat": "codeqwen-1.5-7b",
  "Code Qwen": "code-qwen",
  "Llama 3.1 70b": "llama-3.1-70b",
  "Llama 3.1 8b": "llama-3.1-8b",
  "Codellama 13b": "codellama-13b",
  "Flan-T5-base": "flan-t5-base",
  "T0-3b": "t0-3b",
  "TransArC": "transarc",
  "ArDoCode": "ardocode",
};

// Metrics each task reads straight off a source entry.
const FLAT_METRICS = {
  adr: ["rouge1", "bleu", "meteor", "bertscore_p", "bertscore_r", "bertscore_f1"],
  traceability: ["precision", "recall", "f1", "weighted_avg_f1"],
  diagram: ["ssim", "psnr", "rmse"],
  dynamic: ["precision", "recall", "f1", "f3", "tokens"],
};

const slug = (text) =>
  String(text).toLowerCase().replace(/[^a-z0-9._]+/g, "-").replace(/^-+|-+$/g, "");

const PROMPT_STYLES = [
  [/^(0|zero)[- ]?shot$/i, "zero_shot"],
  [/^(1|one)[- ]?shot$/i, "one_shot"],
  [/^few[- ]?shot$/i, "few_shot"],
];

// "GPT-4o (Zero-Shot)" -> { base: "GPT-4o", prompt_style: "zero_shot", approach: null }
// "GPT-4o (SAD-extracted SAM)" -> { base: "GPT-4o", prompt_style: null, approach: "SAD-extracted SAM" }
export function parseEntryName(name) {
  const match = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(name);
  if (!match) return { base: name.trim(), prompt_style: null, approach: null };
  const [, base, inner] = match;
  const style = PROMPT_STYLES.find(([pattern]) => pattern.test(inner.trim()));
  if (style) return { base, prompt_style: style[1], approach: null };
  if (/^fine[- ]?tuned$/i.test(inner.trim())) return { base, prompt_style: null, approach: "fine_tuned" };
  return { base, prompt_style: null, approach: inner.trim() };
}

const metricValue = (mean) => ({ mean, std: null, n: null });

const pickMetrics = (entry, keys) => {
  const metrics = {};
  for (const [key, sourceKey] of keys) {
    if (typeof entry[sourceKey] === "number") metrics[key] = metricValue(entry[sourceKey]);
  }
  return metrics;
};

const same = (keys) => keys.map((key) => [key, key]);

function row({ task, entry, parsed, variant = null, metrics, primaryMetric, telemetry = null }) {
  const modelId = MODEL_IDS[parsed.base] ?? slug(parsed.base);
  const setupLabel = parsed.approach ?? parsed.prompt_style ?? "default";
  return {
    run_id: ["paper", task, modelId, slug(setupLabel), variant].filter(Boolean).join("-"),
    task,
    model_id: modelId,
    source: "paper",
    date: entry.date,
    setup: { prompt_style: parsed.prompt_style, variant, approach: parsed.approach },
    metrics,
    primary_metric: primaryMetric,
    telemetry,
    completion: null,
    provenance: { archbench_version: null, git_commit: null, link: entry.link ?? null },
  };
}

// sources: { [taskId]: sourceJson } ; tasks: the registry's task table
export function mapPaperResults(sources, tasks) {
  const rows = [];
  for (const [task, source] of Object.entries(sources)) {
    const primaryMetric = tasks[task].primary_metric;
    for (const entry of source.entries) {
      const parsed = parseEntryName(entry.name);
      if (FLAT_METRICS[task]) {
        rows.push(row({ task, entry, parsed, metrics: pickMetrics(entry, same(FLAT_METRICS[task])), primaryMetric }));
      } else if (task === "serverless") {
        const ni = entry.no_intervention;
        const wi = entry.with_intervention;
        rows.push(row({
          task, entry, parsed, variant: "no_intervention", primaryMetric,
          metrics: pickMetrics(ni, [
            ["codebase_tests", "codebase_tests"], ["function_tests", "function_tests"], ["sloc", "source_lines_of_code"],
            ["cyclomatic_complexity", "cyclomatic_complexity"], ["cognitive_complexity", "cognitive_complexity"],
            ["halstead_volume", "halstead_volume"], ["codebleu", "codebleu"],
          ]),
        }));
        rows.push(row({
          task, entry, parsed, variant: "with_intervention", primaryMetric,
          metrics: pickMetrics(wi, same(["codebase_tests", "function_tests"])),
        }));
      } else if (task === "microservice") {
        for (const variant of ["incremental", "clean_state"]) {
          rows.push(row({
            task, entry, parsed, variant, primaryMetric,
            metrics: {
              ...pickMetrics(entry[variant], same(["test_pass_rate_p1", "test_pass_rate_p2"])),
              ...pickMetrics(entry, same(["avg_time_min", "avg_cost_usd"])),
            },
            telemetry: typeof entry.avg_cost_usd === "number" ? { cost_usd: entry.avg_cost_usd } : null,
          }));
        }
      }
    }
  }
  return rows;
}
