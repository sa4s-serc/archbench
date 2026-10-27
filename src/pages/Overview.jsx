import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import changelog from "../data/changelog.json";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { rowsFor } from "../lib/results";
import { humanize } from "../lib/metrics";
import {
  buildMatrix,
  defaultPrompt,
  inhouseRows,
  inhouseTasks,
  primaryMetric,
  promptStyles,
  scatterPoints,
  SCATTER_AXES,
} from "../lib/views";
import RankMatrix from "../components/charts/RankMatrix";
import EfficiencyScatter, { paretoFrontier } from "../components/charts/EfficiencyScatter";
import ResultsTable from "../components/charts/ResultsTable";
import { ChevronRight, Direction, FamilyDot, Page, PageHeader, SectionHeader, Segmented, Tag } from "../components/ui";

const PAPER_URL = "https://arxiv.org/abs/2603.17833";

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Changelog() {
  return (
    <section aria-label="Recent changes" className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-3.5 text-[13px] leading-snug">
      {changelog.slice(0, 3).map((item) => {
        const text = item.to ? (
          <Link to={item.to} className="hover:text-accent">{item.text}</Link>
        ) : item.href ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{item.text}</a>
        ) : (
          item.text
        );
        return (
          <p key={item.date + item.text} className="flex items-baseline gap-2.5">
            <time dateTime={item.date} className="num whitespace-nowrap text-ink-3">{formatDate(item.date)}</time>
            <span>{text}</span>
          </p>
        );
      })}
    </section>
  );
}

function InhouseEmpty() {
  return (
    <section className="mt-14 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-[22px] font-semibold tracking-[-0.015em]">In-house sweep</h2>
        <Tag>In progress</Tag>
      </div>
      <p className="max-w-2xl text-[15px] leading-relaxed text-ink-2">
        We are running small open-weight models, about 1B to 32B parameters in three size tiers, through one harness on
        four tasks: ADR generation, traceability, diagram generation and serverless components. When the results are in,
        this page ranks them task by task and plots accuracy against size and speed.
      </p>
      <p className="max-w-2xl text-[15px] leading-relaxed text-ink-2">
        Until then, the results below come from the papers behind each task.
      </p>
    </section>
  );
}

function MatrixSection({ doc }) {
  const styles = promptStyles(inhouseRows(doc));
  const [prompt, setPrompt] = useState(defaultPrompt(styles));
  const [show, setShow] = useState("rank");
  const matrix = useMemo(() => buildMatrix(doc, prompt, (id) => taskInfo(id).shortName), [doc, prompt]);
  const modelCount = matrix.models.length;

  return (
    <section className="mt-14 flex flex-col gap-5" aria-labelledby="matrix-title">
      <SectionHeader
        title={<span id="matrix-title">Rank by task</span>}
        lead={`In-house sweep: ${modelCount} models, one harness, ranked within each task. Stronger shading is a better rank; rows are sorted by average rank.`}
      >
        {styles.length > 1 && (
          <Segmented label="Prompt setup" value={prompt} onChange={setPrompt} options={styles.map((s) => ({ value: s, label: humanize(s) }))} />
        )}
        <Segmented
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            { value: "rank", label: "Rank" },
            { value: "score", label: "Score" },
            { value: "table", label: "Table" },
          ]}
        />
      </SectionHeader>
      {show === "table" ? (
        <MatrixTable matrix={matrix} />
      ) : (
        <RankMatrix matrix={matrix} show={show} />
      )}
      <MatrixFootnotes doc={doc} prompt={prompt} />
    </section>
  );
}

function MatrixTable({ matrix }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">Rank and primary score of each model on each in-house task</caption>
        <thead>
          <tr className="border-b border-line bg-surface text-left text-xs text-ink-2">
            <th scope="col" className="px-3 py-2.5 font-medium">Model</th>
            {matrix.tasks.map((t) => (
              <th key={t.id} scope="col" className="px-3 py-2.5 text-right font-medium">{t.name} ({t.metric.display_name})</th>
            ))}
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Avg rank</th>
          </tr>
        </thead>
        <tbody>
          {matrix.models.map((m) => (
            <tr key={m.id} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-3 py-2.5 text-left font-medium">
                <Link to={`/models/${encodeURIComponent(m.id)}`} className="hover:text-accent">{m.name}</Link>
              </th>
              {matrix.tasks.map((t) => {
                const c = m.cells[t.id];
                return (
                  <td key={t.id} className="num px-3 py-2.5 text-right">
                    {c?.rank ? <>#{c.rank} <span className="text-ink-2">{c.value.toFixed(3)}</span></> : "–"}
                  </td>
                );
              })}
              <td className="num px-3 py-2.5 text-right">{m.avgRank.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixFootnotes({ doc, prompt }) {
  const notes = [];
  for (const task of inhouseTasks(doc)) {
    const metrics = doc.metrics[task];
    for (const [key, info] of Object.entries(metrics)) {
      const affected = rowsFor(doc, task, { source: "inhouse", prompt }).filter((r) => r.metrics?.[key]?.non_finite > 0);
      if (affected.length) {
        notes.push(
          `${taskInfo(task).shortName} ${info.display_name}: non-finite values (for example a pixel-identical render) were left out of the mean for ${affected.length} model${affected.length > 1 ? "s" : ""}.`,
        );
      }
    }
    const missing = Object.entries(metrics).filter(
      ([key]) => rowsFor(doc, task, { source: "inhouse", prompt }).every((r) => r.metrics?.[key]?.mean == null),
    );
    if (missing.length && missing.length < Object.keys(metrics).length) {
      notes.push(`${taskInfo(task).shortName}: ${missing.map(([, m]) => m.display_name).join(" and ")} not measured in this sweep.`);
    }
  }
  if (!notes.length) return null;
  return (
    <ul className="flex max-w-3xl flex-col gap-1 text-xs leading-relaxed text-ink-3">
      {notes.map((n) => <li key={n}>{n}</li>)}
    </ul>
  );
}

function EfficiencySection({ doc }) {
  const tasks = inhouseTasks(doc);
  const styles = promptStyles(inhouseRows(doc));
  const [task, setTask] = useState(tasks.includes("traceability") ? "traceability" : tasks[0]);
  const [axis, setAxis] = useState("params");
  const [asTable, setAsTable] = useState(false);
  const prompt = defaultPrompt(styles);
  const metric = primaryMetric(doc, task);
  const points = useMemo(() => scatterPoints(doc, task, prompt, axis), [doc, task, prompt, axis]);
  const frontier = paretoFrontier(points, metric.direction);
  const families = [...new Set(points.map((p) => p.family))];
  const hasMoe = points.some((p) => p.moe);

  if (!points.length) return null;

  return (
    <section className="mt-16 flex flex-col gap-5" aria-labelledby="efficiency-title">
      <SectionHeader
        title={<span id="efficiency-title">Accuracy against {axis === "params" ? "size" : "speed"}</span>}
        lead={
          <>
            {metric.display_name} on {taskInfo(task).shortName} (<Direction direction={metric.direction} className="lowercase" />)
            {" "}against {axis === "params" ? "parameter count" : "median latency"}. The line joins models that nothing {SCATTER_AXES[axis].smaller} beats.
            {prompt && ` ${humanize(prompt)}.`}
          </>
        }
      >
        <Segmented label="Task" value={task} onChange={setTask} options={tasks.map((t) => ({ value: t, label: taskInfo(t).shortName }))} />
        <Segmented
          label="Horizontal axis"
          value={axis}
          onChange={setAxis}
          options={[
            { value: "params", label: "Parameters" },
            { value: "latency", label: "Latency" },
          ]}
        />
      </SectionHeader>
      <div className="flex flex-wrap items-start gap-10">
        <div className="min-w-0 flex-[999_1_560px]">
          {asTable ? (
            <ResultsTable
              rows={rowsFor(doc, task, { source: "inhouse", prompt })}
              metrics={[metric]}
              models={doc.models}
              ranked
              label={`${metric.display_name} on ${taskInfo(task).shortName}`}
            />
          ) : (
            <EfficiencyScatter points={points} metric={metric} xAxis={{ ...SCATTER_AXES[axis] }} />
          )}
        </div>
        <aside className="flex flex-[1_1_220px] flex-col gap-3">
          <h3 className="text-sm font-semibold">On the frontier</h3>
          <ol className="flex flex-col text-[13px]">
            {[...frontier].reverse().map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 border-t border-line py-2">
                <Link to={`/models/${encodeURIComponent(p.id)}`} className="flex items-center gap-2 hover:text-accent">
                  <FamilyDot family={p.family} />
                  {p.name}
                </Link>
                <span className="num text-ink-2">{p.y.toFixed(3)}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 pt-1 text-xs text-ink-2">
            {families.map((f) => (
              <span key={f} className="flex items-center gap-1.5"><FamilyDot family={f} />{f}</span>
            ))}
          </div>
          {hasMoe && (
            <p className="text-xs leading-relaxed text-ink-3">
              Mixture-of-experts models are placed by total parameters on the size chart; their active parameters are in the tooltip.
            </p>
          )}
          <button type="button" onClick={() => setAsTable((v) => !v)} className="link self-start text-[13px]">
            {asTable ? "View as chart" : "View as table"}
          </button>
        </aside>
      </div>
    </section>
  );
}

function PaperTasks({ doc }) {
  return (
    <section className="mt-16 flex flex-col gap-4" aria-labelledby="papers-title">
      <SectionHeader
        title={<span id="papers-title">Reported in papers</span>}
        lead="Numbers copied from the publications behind each task, each with its own setup. They are context, not competitors: they are never ranked against the in-house sweep."
      />
      <ul className="flex flex-col">
        {Object.keys(doc.tasks).map((id) => {
          // One result per model and setup; variants of the same run count once.
          const count = new Set(
            rowsFor(doc, id, { source: "paper" }).map((r) => [r.model_id, r.setup?.prompt_style, r.setup?.approach].join("|")),
          ).size;
          const metric = primaryMetric(doc, id);
          return (
            <li key={id}>
              <Link
                to={`/tasks/${id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-x-4 gap-y-1 border-t border-line px-1 py-4 transition-colors duration-150 hover:bg-surface sm:grid-cols-[minmax(0,1fr)_auto_auto_16px]"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-medium">{doc.tasks[id].name}</span>
                  <span className="truncate text-[13px] text-ink-2">{taskInfo(id).summary}</span>
                </span>
                <span className="hidden items-center gap-3 text-xs text-ink-2 sm:flex">
                  {!doc.tasks[id].inhouse && <Tag>Paper only</Tag>}
                  <span>{metric.display_name}</span>
                </span>
                <span className="num whitespace-nowrap text-right text-[13px] text-ink-2">
                  {count} result{count === 1 ? "" : "s"}
                </span>
                <span className="text-ink-3"><ChevronRight /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Overview() {
  const doc = useResults();
  const hasInhouse = inhouseTasks(doc).length > 0;

  return (
    <Page>
      <PageHeader
        title="Benchmarking language models on software architecture"
        lead="Six architecture tasks, from decision records to diagrams. Our own sweep of small open-weight models is ranked within each task; results reported in papers are shown beside it and never ranked against it."
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href={PAPER_URL} target="_blank" rel="noopener noreferrer" className="link">Read the paper</a>
          <Link to="/tasks" className="link">How each task is scored</Link>
        </div>
      </PageHeader>
      <Changelog />
      {hasInhouse ? (
        <>
          <MatrixSection doc={doc} />
          <EfficiencySection doc={doc} />
        </>
      ) : (
        <InhouseEmpty />
      )}
      <PaperTasks doc={doc} />
    </Page>
  );
}
