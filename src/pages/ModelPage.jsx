import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { defaultMetric, promptOf, rowsFor } from "../lib/results";
import { formatNumber, formatWithStd, humanize, meanOf, rankByMetric, setupLabel, stdOf } from "../lib/metrics";
import { defaultPrompt, formatParams, inhouseTasks, primaryMetric, promptStyles, tierLabel } from "../lib/views";
import { DirectionArrow, ExternalIcon, FamilyDot, Page, Segmented, SourceBadge } from "../components/ui";
import NotFound from "./NotFound";

const seconds = (ms) => (ms == null ? "–" : (ms / 1000).toFixed(2));

// One task row: rank, score and a strip of every in-house model's score.
function TaskStrip({ doc, task, modelId, prompt }) {
  const metric = primaryMetric(doc, task);
  const rows = rowsFor(doc, task, { source: "inhouse", prompt });
  const ranked = rankByMetric(rows, metric.key, metric.direction);
  const mine = ranked.find((r) => r.row.model_id === modelId);
  if (!mine) return null;
  const values = ranked.map((r) => meanOf(r.row, metric.key)).filter((v) => v !== null);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  // Better is always to the right, whatever the metric's direction.
  const pos = (v) => {
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    return `${((metric.direction === "lower" ? 1 - t : t) * 100).toFixed(2)}%`;
  };
  const value = meanOf(mine.row, metric.key);
  const shown = formatWithStd(value, stdOf(mine.row, metric.key), metric.unit);
  const count = ranked.filter((r) => r.rank !== null).length;

  return (
    <li>
      <Link to={`/tasks/${task}`} className="flex flex-col gap-2.5 border-t border-line py-4 text-ink transition-colors duration-150 hover:bg-surface sm:px-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-[15px] font-medium">{doc.tasks[task].name}</span>
          <span className="num text-[13px] text-ink-2">
            Rank <strong className="font-semibold text-ink">{mine.rank ?? "–"}</strong> of {count}
          </span>
        </span>
        <span className="flex items-baseline justify-between gap-4 text-[13px]">
          <span className="text-ink-3">
            {metric.display_name}
            <DirectionArrow direction={metric.direction} />
          </span>
          <span className="num">
            {shown.value}
            {shown.std && <span className="text-ink-3"> ±{shown.std}</span>}
          </span>
        </span>
        <span className="relative block h-[18px]" aria-hidden="true">
          <span className="absolute inset-x-0 top-2 h-px bg-line" />
          {ranked
            .filter((r) => r.row.model_id !== modelId && meanOf(r.row, metric.key) !== null)
            .map((r) => (
              <span key={r.row.run_id} className="absolute top-1 -ml-1 h-2 w-2 rounded-full bg-ink-3 opacity-60" style={{ left: pos(meanOf(r.row, metric.key)) }} />
            ))}
          <span className="absolute top-px -ml-[7px] h-3.5 w-3.5 rounded-full bg-accent ring-2 ring-page" style={{ left: pos(value) }} />
        </span>
        <span className="num flex justify-between text-[11px] text-ink-3" aria-hidden="true">
          <span>Worst {formatNumber(metric.direction === "lower" ? hi : lo, metric.unit)}</span>
          <span>Best {formatNumber(metric.direction === "lower" ? lo : hi, metric.unit)}</span>
        </span>
      </Link>
    </li>
  );
}

function PromptComparison({ doc, modelId, tasks, styles }) {
  const lines = tasks.map((task) => {
    const metric = primaryMetric(doc, task);
    const cells = styles.map((style) => rowsFor(doc, task, { source: "inhouse", prompt: style }).find((r) => r.model_id === modelId));
    const values = cells.map((r) => (r ? meanOf(r, metric.key) : null));
    const spread = Math.max(0, ...cells.map((r) => (r ? stdOf(r, metric.key) ?? 0 : 0)));
    const [first, last] = [values[0], values[values.length - 1]];
    let change = "–";
    if (first !== null && last !== null) {
      const delta = last - first;
      change =
        Math.abs(delta) < 2 * spread
          ? "≈"
          : `${delta > 0 ? "+" : "−"}${formatNumber(Math.abs(delta), metric.unit, metric.unit === "score" ? 3 : undefined)}`;
    }
    return { task, metric, values, change };
  });

  return (
    <section className="flex flex-col gap-3" aria-labelledby="prompt-title">
      <h2 id="prompt-title" className="text-lg font-semibold tracking-[-0.01em]">By prompt setup</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <caption className="sr-only">Primary score on each task for each prompt setup</caption>
          <thead>
            <tr className="text-left text-xs text-ink-3">
              <th scope="col" className="pb-2 font-normal">Task</th>
              {styles.map((s) => <th key={s} scope="col" className="pb-2 text-right font-normal">{humanize(s)}</th>)}
              <th scope="col" className="pb-2 text-right font-normal">Change</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.task} className="border-t border-line">
                <th scope="row" className="py-2.5 text-left font-normal">
                  {taskInfo(l.task).shortName} <span className="text-ink-3">{l.metric.display_name}</span>
                </th>
                {l.values.map((v, i) => <td key={styles[i]} className="num py-2.5 text-right">{formatNumber(v, l.metric.unit)}</td>)}
                <td className="num py-2.5 text-right font-medium">{l.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-ink-3">
        Change is {humanize(styles[styles.length - 1]).toLowerCase()} minus {humanize(styles[0]).toLowerCase()}. Differences
        smaller than two standard deviations are shown as ≈.
      </p>
    </section>
  );
}

function SpeedTable({ doc, modelId, tasks, prompt }) {
  const rows = tasks
    .map((task) => ({ task, row: rowsFor(doc, task, { source: "inhouse", prompt }).find((r) => r.model_id === modelId) }))
    .filter((x) => x.row?.telemetry);
  if (!rows.length) return null;
  const tokensPerSec = rows.find((x) => x.row.telemetry.tokens_per_sec != null)?.row.telemetry.tokens_per_sec;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="speed-title">
      <h2 id="speed-title" className="text-lg font-semibold tracking-[-0.01em]">Speed and compute</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <caption className="sr-only">Latency and GPU time per task</caption>
          <thead>
            <tr className="text-left text-xs text-ink-3">
              <th scope="col" className="pb-2 font-normal">Task</th>
              <th scope="col" className="pb-2 text-right font-normal">Latency p50</th>
              <th scope="col" className="pb-2 text-right font-normal">p95</th>
              <th scope="col" className="pb-2 text-right font-normal">GPU-hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ task, row }) => (
              <tr key={task} className="border-t border-line">
                <th scope="row" className="py-2.5 text-left font-normal">{taskInfo(task).shortName}</th>
                <td className="num py-2.5 text-right">{seconds(row.telemetry.latency_ms_p50)} s</td>
                <td className="num py-2.5 text-right">{seconds(row.telemetry.latency_ms_p95)} s</td>
                <td className="num py-2.5 text-right">{row.telemetry.gpu_hours == null ? "–" : row.telemetry.gpu_hours.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-ink-3">
        Per-request latency.{tokensPerSec != null && ` Decode speed ${Math.round(tokensPerSec).toLocaleString("en-US")} tokens/s.`} GPU-hours
        are compute on our hardware, not a dollar cost.
      </p>
    </section>
  );
}

function RunSetup({ rows }) {
  const setup = rows[0]?.setup ?? {};
  const completion = rows.reduce(
    (acc, r) => (r.completion ? { total: acc.total + r.completion.total, success: acc.success + r.completion.success } : acc),
    { total: 0, success: 0 },
  );
  const items = [
    ["Engine", setup.engine],
    ["Hardware", setup.hardware],
    ["Precision", setup.quantization],
    ["Temperature", setup.temperature],
    ["Max tokens", setup.max_tokens?.toLocaleString("en-US")],
    ["Seeds", setup.seeds?.join(", ")],
    ["Completed", completion.total ? `${completion.success.toLocaleString("en-US")} of ${completion.total.toLocaleString("en-US")} requests` : null],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="setup-title">
      <h2 id="setup-title" className="text-lg font-semibold tracking-[-0.01em]">How it was run</h2>
      <dl className="flex flex-col text-sm">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 border-t border-line py-2.5">
            <dt className="text-ink-3">{k}</dt>
            <dd className="num text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PaperResults({ doc, modelId }) {
  const rows = doc.results.filter((r) => r.source === "paper" && r.model_id === modelId);
  return (
    <section className="flex flex-col gap-3" aria-labelledby="paper-title">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="paper-title" className="text-lg font-semibold tracking-[-0.01em]">Reported in papers</h2>
        <SourceBadge source="paper" />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-2">No published results for this model yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <caption className="sr-only">Published results for this model</caption>
            <thead>
              <tr className="text-left text-xs text-ink-3">
                <th scope="col" className="pb-2 font-normal">Task</th>
                <th scope="col" className="pb-2 font-normal">Setup</th>
                <th scope="col" className="pb-2 text-right font-normal">Result</th>
                <th scope="col" className="pb-2 text-right font-normal">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const metric = defaultMetric(doc, r.task, [r]);
                const setup = [setupLabel(r), r.setup?.variant ? humanize(r.setup.variant) : null].filter(Boolean).join(", ");
                return (
                  <tr key={r.run_id} className="border-t border-line">
                    <th scope="row" className="py-2.5 pr-4 text-left font-normal">
                      <Link to={`/tasks/${r.task}`} className="hover:text-accent">{taskInfo(r.task).shortName}</Link>
                    </th>
                    <td className="py-2.5 pr-4 text-ink-2">{setup || "–"}</td>
                    <td className="num whitespace-nowrap py-2.5 text-right">
                      {metric ? (
                        <>
                          <span className="text-ink-3">{metric.display_name} </span>
                          {formatNumber(meanOf(r, metric.key), metric.unit)}
                        </>
                      ) : "–"}
                    </td>
                    <td className="py-2.5 text-right">
                      {r.provenance?.link ? (
                        <a href={r.provenance.link} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                          {r.date?.slice(0, 4)} <ExternalIcon size={12} />
                        </a>
                      ) : (
                        <span className="text-ink-3">{r.date?.slice(0, 4)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ModelPage() {
  const { modelId } = useParams();
  const doc = useResults();
  const model = doc.models[modelId];
  const [prompt, setPrompt] = useState(null);

  const mine = doc.results.filter((r) => r.model_id === modelId);
  if (!model && !mine.length) return <NotFound />;

  const inhouse = mine.filter((r) => r.source === "inhouse");
  const tasks = inhouseTasks(doc).filter((t) => inhouse.some((r) => r.task === t));
  const styles = promptStyles(inhouse);
  const activePrompt = styles.includes(prompt) ? prompt : defaultPrompt(styles);
  const moe = model?.active_params_b != null && model.active_params_b !== model.params_b;

  const facts = [
    ["Parameters", model?.params_b != null ? (moe ? `${formatParams(model)} total, ${model.active_params_b}B active` : formatParams(model)) : "Not disclosed"],
    ["Size tier", model?.tier ? tierLabel(doc, model.tier) : null],
    ["Weights", model ? (model.open_weights ? "Open" : "Closed") : null],
    ["Thinking mode", model ? (model.reasoning ? "Yes" : "No") : null],
  ].filter(([, v]) => v);

  return (
    <Page>
      <nav aria-label="Breadcrumb" className="pt-8 text-[13px] text-ink-3">
        <Link to="/models" className="text-ink-2 hover:text-ink">Models</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{model?.display_name ?? modelId}</span>
      </nav>
      <header className="flex max-w-3xl flex-col gap-4 pt-4">
        {model && (
          <p className="flex items-center gap-2 text-[13px] text-ink-2">
            <FamilyDot family={model.family} />
            {model.family} family, {model.org}
          </p>
        )}
        <h1 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.022em] sm:text-[36px]">{model?.display_name ?? modelId}</h1>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-3">{k}</dt>
              <dd className="num mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={`mt-12 grid grid-cols-[minmax(0,1fr)] gap-14 ${inhouse.length ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" : "max-w-3xl"}`}>
        <div className="flex flex-col gap-14">
          {inhouse.length > 0 && (
            <section className="flex flex-col gap-3" aria-labelledby="tasks-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 id="tasks-title" className="text-lg font-semibold tracking-[-0.01em]">Across tasks</h2>
                  <SourceBadge source="inhouse" />
                </div>
                {styles.length > 1 && (
                  <Segmented label="Prompt setup" value={activePrompt} onChange={setPrompt} options={styles.map((s) => ({ value: s, label: humanize(s) }))} />
                )}
              </div>
              <p className="text-[13px] leading-relaxed text-ink-2">
                Each strip shows every in-house model on that task, better to the right. This model is the accent mark.
              </p>
              <ul className="flex flex-col">
                {tasks.map((t) => <TaskStrip key={t} doc={doc} task={t} modelId={modelId} prompt={activePrompt} />)}
              </ul>
            </section>
          )}
          <PaperResults doc={doc} modelId={modelId} />
        </div>
        {inhouse.length > 0 && (
          <div className="flex flex-col gap-14">
            {styles.length > 1 && <PromptComparison doc={doc} modelId={modelId} tasks={tasks} styles={styles} />}
            <SpeedTable doc={doc} modelId={modelId} tasks={tasks} prompt={activePrompt} />
            <RunSetup rows={inhouse.filter((r) => promptOf(r) === activePrompt)} />
          </div>
        )}
      </div>
    </Page>
  );
}
