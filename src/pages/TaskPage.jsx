import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { defaultMetric, distinct, metricsWithData, promptOf, rowsFor, variantOf } from "../lib/results";
import { DIRECTION_LABEL, humanize } from "../lib/metrics";
import { defaultPrompt, promptStyles } from "../lib/views";
import RankedBars, { barDomain, directionSentence } from "../components/charts/RankedBars";
import ResultsTable from "../components/charts/ResultsTable";
import { Chips, Direction, ExternalIcon, Page, Segmented, SourceBadge, Tag } from "../components/ui";
import NotFound from "./NotFound";

// Markdown rendering is only needed once someone opens the example.
const ExampleDialog = lazy(() => import("../components/ExampleDialog"));

const UNIT_NAMES = {
  score: "score",
  percent: "percent",
  dB: "decibels",
  radians: "radians",
  lines: "lines",
  count: "count",
  tokens: "tokens",
  minutes: "minutes",
  usd: "US dollars",
};

function Footnotes({ metric, rows, models }) {
  const nonFinite = rows.filter((r) => r.metrics?.[metric.key]?.non_finite > 0);
  const selfReported = rows.some((r) => r.metrics?.[metric.key]?.self_reported);
  if (!nonFinite.length && !selfReported) return null;
  const names = nonFinite.map((r) => models[r.model_id]?.display_name ?? r.model_id);
  return (
    <ul className="flex flex-col gap-1 text-xs leading-relaxed text-ink-3">
      {nonFinite.length > 0 && (
        <li>
          Non-finite values (for example a pixel-identical render) were left out of the mean for {names.join(", ")}.
        </li>
      )}
      {selfReported && <li>Self-reported values come from the submission and were not checked by the harness.</li>}
    </ul>
  );
}

function sweepSummary(rows) {
  const first = rows[0];
  const seeds = first?.setup?.seeds?.length;
  const n = first ? Object.values(first.metrics ?? {}).find((m) => m.n)?.n : null;
  const parts = [`${rows.length} models, same harness`];
  if (seeds) parts.push(`${seeds} seed${seeds > 1 ? "s" : ""}`);
  if (n) parts.push(`${n} instances each`);
  return `${parts.join(", ")}.${seeds > 1 ? " Whiskers show ±1 standard deviation across seeds." : ""}`;
}

export default function TaskPage() {
  const { taskId } = useParams();
  const doc = useResults();
  const task = doc.tasks[taskId];
  const info = taskInfo(taskId);

  const allRows = useMemo(() => (task ? rowsFor(doc, taskId) : []), [doc, taskId, task]);
  const variants = distinct(allRows, variantOf).filter((v) => v !== null);
  const styles = promptStyles(allRows.filter((r) => r.source === "inhouse"));

  const [variant, setVariant] = useState(variants[0] ?? null);
  const [prompt, setPrompt] = useState(null);
  const [metricKey, setMetricKey] = useState(null);
  const [view, setView] = useState("chart");
  const [exampleOpen, setExampleOpen] = useState(false);

  if (!task) return <NotFound />;

  // Derived rather than stored, so a results document that arrives later
  // (the dev fixture) still selects a valid variant and prompt.
  const activeVariant = variants.includes(variant) ? variant : variants[0] ?? null;
  const activePrompt = styles.includes(prompt) ? prompt : defaultPrompt(styles);
  const inhouse = allRows.filter((r) => r.source === "inhouse" && (styles.length < 2 || promptOf(r) === activePrompt));
  const paper = allRows.filter((r) => r.source === "paper" && (!variants.length || variantOf(r) === activeVariant));
  const shown = [...inhouse, ...paper];
  const available = metricsWithData(doc, taskId, shown);
  const metric = available.find((m) => m.key === metricKey) ?? defaultMetric(doc, taskId, shown);
  const domain = metric ? barDomain(metric, [inhouse, paper]) : [0, 1];
  const note = metric ? info.metricNote(metric.key) : null;

  return (
    <Page>
      <nav aria-label="Breadcrumb" className="pt-8 text-[13px] text-ink-3">
        <Link to="/tasks" className="text-ink-2 hover:text-ink">Tasks</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{task.name}</span>
      </nav>
      <header className="flex max-w-3xl flex-col gap-4 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.022em] sm:text-[36px]">{task.name}</h1>
          {!task.inhouse && <Tag>Paper only</Tag>}
        </div>
        <p className="text-base leading-relaxed text-ink-2">{info.description}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {info.datasetLink && (
            <a href={info.datasetLink} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">Dataset <ExternalIcon size={12} /></a>
          )}
          {info.paperLink && (
            <a href={info.paperLink} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">Paper <ExternalIcon size={12} /></a>
          )}
          {info.codeLink && (
            <a href={info.codeLink} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">Code <ExternalIcon size={12} /></a>
          )}
          {info.exampleFile && (
            <button type="button" onClick={() => setExampleOpen(true)} className="link">Example input and output</button>
          )}
        </div>
      </header>

      {metric ? (
        <>
          <section className="mt-10 flex flex-col gap-4" aria-label="Results controls">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Chips
                label="Metric"
                value={metric.key}
                onChange={setMetricKey}
                options={available.map((m) => ({
                  value: m.key,
                  label: `${m.display_name}${m.direction === "higher" ? " ↑" : m.direction === "lower" ? " ↓" : ""}`,
                }))}
              />
              <div className="flex flex-wrap gap-3">
                {variants.length > 1 && (
                  <Segmented label="Setting" value={activeVariant} onChange={setVariant} options={variants.map((v) => ({ value: v, label: humanize(v) }))} />
                )}
                {styles.length > 1 && (
                  <Segmented label="Prompt setup" value={activePrompt} onChange={setPrompt} options={styles.map((s) => ({ value: s, label: humanize(s) }))} />
                )}
                <Segmented label="View" value={view} onChange={setView} options={[{ value: "chart", label: "Chart" }, { value: "table", label: "Table" }]} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-[22px] font-semibold tracking-[-0.015em]">{metric.display_name}</h2>
                <Direction direction={metric.direction} className="text-sm font-medium" />
                <span className="text-sm text-ink-3">{UNIT_NAMES[metric.unit] ?? metric.unit}</span>
              </div>
              {note && <p className="max-w-2xl text-sm leading-relaxed text-ink-2">{/[.!?]$/.test(note) ? note : `${note}.`}</p>}
            </div>
          </section>

          {task.inhouse && (
            <section className="mt-8 flex flex-col gap-3" aria-labelledby="inhouse-title">
              <div className="flex flex-wrap items-center gap-3">
                <h3 id="inhouse-title" className="sr-only">In-house sweep</h3>
                <SourceBadge source="inhouse" />
                <span className="text-[13px] text-ink-2">
                  {inhouse.length ? sweepSummary(inhouse) : "In-house results for this task are in progress."}
                </span>
              </div>
              {inhouse.length > 0 &&
                (view === "chart" ? (
                  <RankedBars rows={inhouse} metric={metric} models={doc.models} ranked domain={domain} label={`In-house ranking by ${metric.display_name}. ${directionSentence(metric)}`} />
                ) : (
                  <ResultsTable rows={inhouse} metrics={available} models={doc.models} ranked initialSort={metric.key} label="In-house results" />
                ))}
              <Footnotes metric={metric} rows={inhouse} models={doc.models} />
            </section>
          )}

          <section className="mt-12 flex flex-col gap-3" aria-labelledby="paper-title">
            <div className="flex flex-col gap-2">
              <h3 id="paper-title" className="text-lg font-semibold tracking-[-0.01em]">Reported in papers</h3>
              <div className="flex flex-wrap items-center gap-3">
                <SourceBadge source="paper" />
                <span className="max-w-2xl text-[13px] text-ink-2">
                  Copied from publications, each with its own prompts and harness. Sorted by {metric.display_name}
                  {metric.direction !== "none" && ` (${DIRECTION_LABEL[metric.direction].toLowerCase()})`} but not ranked
                  {task.inhouse && ", and not comparable with the in-house sweep"}.
                </span>
              </div>
            </div>
            {paper.length > 0 ? (
              view === "chart" ? (
                <RankedBars rows={paper} metric={metric} models={doc.models} ranked={false} domain={domain} label={`Paper results by ${metric.display_name}`} />
              ) : (
                <ResultsTable rows={paper} metrics={available} models={doc.models} ranked={false} initialSort={metric.key} label="Paper results" />
              )
            ) : (
              <p className="text-sm text-ink-2">No paper reports {metric.display_name} for this setting.</p>
            )}
          </section>
        </>
      ) : (
        <p className="mt-10 text-sm text-ink-2">No results for this task yet.</p>
      )}

      <section className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2" aria-labelledby="about-title">
        <div className="flex flex-col gap-4">
          <h2 id="about-title" className="text-lg font-semibold">About the task</h2>
          <dl className="flex flex-col text-sm">
            {info.facts.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-t border-line py-3">
                <dt className="text-ink-3">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Metrics</h2>
          <dl className="flex flex-col text-sm">
            {Object.entries(doc.metrics[taskId]).map(([key, m]) => (
              <div key={key} className="flex flex-col gap-1 border-t border-line py-3">
                <dt className="flex flex-wrap items-baseline gap-x-3 font-medium">
                  {m.display_name}
                  <Direction direction={m.direction} className="text-xs font-normal text-ink-2" />
                </dt>
                {info.metricNote(key) && <dd className="text-ink-2">{info.metricNote(key)}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {info.exampleFile && exampleOpen && (
        <Suspense fallback={null}>
          <ExampleDialog file={info.exampleFile} title={info.exampleTitle} open onClose={() => setExampleOpen(false)} />
        </Suspense>
      )}
    </Page>
  );
}
