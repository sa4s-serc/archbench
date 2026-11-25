import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronRight, FileText } from "lucide-react";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { defaultMetric, metricsWithData, rowsFor } from "../lib/results";
import { DIRECTION_LABEL, humanize } from "../lib/metrics";
import { defaultPrompt, promptStyles } from "../lib/views";
import { taskEntries } from "../lib/insights";
import { TASK_ICONS } from "../lib/taskIcons";
import ResultsTable from "../components/charts/ResultsTable";
import { Dialog, ExternalIcon, SectionTitle, SizeSlider, fitsSize } from "../components/ui";
import NotFound from "./NotFound";

function Example({ file, title, open, onClose }) {
  const [text, setText] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!open || text !== null) return;
    fetch(`/${file}`).then((r) => (r.ok ? r.text() : Promise.reject())).then(setText).catch(() => setFailed(true));
  }, [open, file, text]);
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {failed && <p className="text-sm">The example could not be loaded. <a href={`/${file}`} className="link">Open the file</a>.</p>}
      {!failed && text === null && <p className="text-sm text-base-content/60">Loading…</p>}
      {text && <div className="prose prose-sm max-w-none"><ReactMarkdown>{text}</ReactMarkdown></div>}
    </Dialog>
  );
}

function Categories({ doc, current }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-base-300/50 bg-base-200/30 md:block">
      <nav aria-label="Tasks" className="sticky top-16 space-y-1 p-4">
        <p className="mb-2 px-3 text-xs font-medium text-base-content/50">Tasks</p>
        {Object.keys(doc.tasks).map((t) => {
          const Icon = TASK_ICONS[t];
          const count = new Set(rowsFor(doc, t).map((r) => r.model_id)).size;
          return (
            <NavLink
              key={t}
              to={`/leaderboard/${t}`}
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${isActive ? "bg-primary/10 font-semibold text-primary shadow-sm" : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t === current ? "bg-primary/15" : "bg-base-300/50 group-hover:bg-primary/10"}`}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm">{taskInfo(t).shortName}</span>
                <span className="text-[11px] font-normal text-base-content/45">{`${count} models`}</span>
              </span>
              {t === current && <ChevronRight size={14} className="ml-auto shrink-0 text-primary/50" aria-hidden="true" />}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default function Leaderboard() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const doc = useResults();
  const task = doc.tasks[taskId];
  const info = taskInfo(taskId);
  const allRows = useMemo(() => (task ? rowsFor(doc, taskId) : []), [doc, taskId, task]);
  const [metricKey, setMetricKey] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [variant, setVariant] = useState(null);
  const [maxSize, setMaxSize] = useState(Infinity);
  const [worstFirst, setWorstFirst] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);

  useEffect(() => {
    setMetricKey(null);
    setVariant(null);
    setWorstFirst(false);
  }, [taskId]);

  if (!task) return <NotFound />;

  const styles = promptStyles(allRows).sort((a, b) => (a === "zero_shot" ? -1 : b === "zero_shot" ? 1 : 0));
  const activePrompt = styles.includes(prompt) ? prompt : defaultPrompt(styles);
  const base = taskEntries(doc, taskId, { prompt: styles.length > 1 ? activePrompt : null, variant });
  const variants = base.variants;
  const activeVariant = base.activeVariant;
  const inTier = (r) => fitsSize(doc.models[r.model_id], maxSize);
  const shownRows = base.rows.filter(inTier);
  const available = metricsWithData(doc, taskId, shownRows);
  const metric = available.find((m) => m.key === metricKey) ?? defaultMetric(doc, taskId, shownRows);
  const repeats = Math.max(0, ...shownRows.map((r) => r.setup?.seeds?.length ?? 0));
  const hasSizes = base.rows.some((r) => doc.models[r.model_id]?.params_b != null);
  const sortBy = (key) => {
    if (key === metric?.key) setWorstFirst((w) => !w);
    else {
      setMetricKey(key);
      setWorstFirst(false);
    }
  };


  return (
    <>
      <div className="flex min-h-screen">
        <Categories doc={doc} current={taskId} />
        <div className="min-w-0 flex-1 p-4 pb-16 sm:p-6 lg:p-8">
          <label className="mb-5 block md:hidden">
            <span className="mb-1 block text-xs text-base-content/50">Task</span>
            <select value={taskId} onChange={(e) => navigate(`/leaderboard/${e.target.value}`)} className="select select-bordered select-sm w-full rounded-xl">
              {Object.keys(doc.tasks).map((t) => <option key={t} value={t}>{doc.tasks[t].name}</option>)}
            </select>
          </label>

          <div className="card-flat flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
              {(() => {
                const Icon = TASK_ICONS[taskId];
                return <Icon size={20} aria-hidden="true" />;
              })()}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-snug">{task.name}</h1>
              <p className="mt-1 text-sm text-base-content/70">{info.summary}</p>
              <details className="group mt-2 text-sm">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-primary [&::-webkit-details-marker]:hidden">
                  <ChevronRight size={13} className="transition-transform group-open:rotate-90" aria-hidden="true" />
                  More about this task
                </summary>
                <p className="mt-2 leading-relaxed text-base-content/70">{info.description}</p>
                <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-3">
                  {info.facts.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs font-medium text-base-content/50">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                {info.paperLink && <a href={info.paperLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Paper <ExternalIcon size={12} /></a>}
                {info.datasetLink && <a href={info.datasetLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Dataset <ExternalIcon size={12} /></a>}
                {info.codeLink && <a href={info.codeLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Code <ExternalIcon size={12} /></a>}
              </div>
            </div>
            {info.exampleFile && (
              <button type="button" onClick={() => setExampleOpen(true)} className="btn btn-sm btn-outline shrink-0 gap-1.5 self-start rounded-xl">
                <FileText size={14} aria-hidden="true" /> View an example
              </button>
            )}
          </div>

          {metric && (
            <>
              <section className="mt-5 flex flex-col gap-3" aria-labelledby="ranking-title">
                <div>
                  <h2 id="ranking-title" className="text-lg font-bold">Overall ranking</h2>
                  <p className="text-sm text-base-content/60">
                    Every model ranked by {metric.display_name} ({DIRECTION_LABEL[metric.direction].toLowerCase()}), with every other score alongside.
                    Select a column header to rank by it.{repeats > 1 ? " ± is the spread between repeated runs." : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-x-5 gap-y-3 rounded-2xl border border-base-300/50 p-3">
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="text-base-content/60">Rank by</span>
                    <select value={metric.key} onChange={(e) => setMetricKey(e.target.value)} className="select select-bordered select-sm rounded-xl">
                      {available.map((m) => <option key={m.key} value={m.key}>{m.display_name}</option>)}
                    </select>
                  </label>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-base-content/60">Order</span>
                    <div role="group" aria-label="Order" className="join">
                      {[[false, "Best first", ArrowDownWideNarrow], [true, "Worst first", ArrowUpNarrowWide]].map(([v, label, Icon]) => (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={worstFirst === v}
                          onClick={() => setWorstFirst(v)}
                          className={`btn join-item btn-sm gap-1.5 font-medium ${worstFirst === v ? "btn-primary" : "btn-ghost border-base-300"}`}
                        >
                          <Icon size={14} aria-hidden="true" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {styles.length > 1 && (
                    <label className="flex flex-col gap-1 text-xs">
                      <span className="text-base-content/60">Prompt</span>
                      <select value={activePrompt} onChange={(e) => setPrompt(e.target.value)} className="select select-bordered select-sm rounded-xl">
                        {styles.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                      </select>
                    </label>
                  )}
                  {variants.length > 1 && (
                    <label className="flex flex-col gap-1 text-xs">
                      <span className="text-base-content/60">Setting</span>
                      <select value={activeVariant} onChange={(e) => setVariant(e.target.value)} className="select select-bordered select-sm rounded-xl">
                        {variants.map((v) => <option key={v} value={v}>{humanize(v)}</option>)}
                      </select>
                    </label>
                  )}
                  {hasSizes && <SizeSlider value={maxSize} onChange={setMaxSize} className="w-full sm:w-60" />}
                </div>
                {shownRows.length ? (
                  <ResultsTable rows={shownRows} metrics={available} models={doc.models} sortKey={metric.key} reversed={worstFirst} onSort={sortBy} label={`${task.name} leaderboard`} />
                ) : (
                  <p className="card-flat p-5 text-sm text-base-content/60">No entries match these filters.</p>
                )}
              </section>
            </>
          )}

          <section className="mt-10 flex flex-col gap-3">
            <SectionTitle title="What the scores mean" />
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(doc.metrics[taskId]).map(([key, m]) => (
                <div key={key} className="rounded-xl border border-base-300/50 p-4">
                  <dt className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
                    {m.display_name}
                    <span className="text-xs font-normal text-base-content/50">{DIRECTION_LABEL[m.direction]}</span>
                  </dt>
                  {info.metricNote(key) && <dd className="mt-1 text-sm text-base-content/65">{info.metricNote(key)}</dd>}
                </div>
              ))}
            </dl>
            <p className="text-sm text-base-content/60">
              The full evaluation protocol is described in the <Link to="/methodology" className="text-primary hover:underline">methodology</Link>.
            </p>
          </section>
        </div>
      </div>
      {info.exampleFile && <Example file={info.exampleFile} title={info.exampleTitle} open={exampleOpen} onClose={() => setExampleOpen(false)} />}
    </>
  );
}
