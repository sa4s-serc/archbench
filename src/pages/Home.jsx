import { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Trophy } from "lucide-react";
import changelog from "../data/changelog.json";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { formatNumber } from "../lib/metrics";
import { formatParams } from "../lib/views";
import { overallStandings, taskEntries } from "../lib/insights";
import { TASK_ICONS } from "../lib/taskIcons";
import RankBars from "../components/charts/RankBars";
import RankHeatmap from "../components/charts/RankHeatmap";
import SizeScatter, { bestForSize } from "../components/charts/SizeScatter";
import { BlueprintFrame, ModelLogo, Page, SectionTitle } from "../components/ui";

const shortName = (id) => taskInfo(id).shortName;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Each model's best entry per task, best first.
function uniqueEntries(doc, task) {
  const view = taskEntries(doc, task, { prompt: "zero_shot" });
  const seen = new Set();
  const out = [];
  for (const e of view.entries) if (!seen.has(e.id)) { seen.add(e.id); out.push(e); }
  return { ...view, best: out };
}

function Name({ e }) {
  return (
    <Link to={`/models/${encodeURIComponent(e.id)}`} className="inline-flex items-baseline gap-1 font-medium text-base-content hover:text-primary">
      <span className="self-center"><ModelLogo model={e.model} size={14} /></span>
      {e.name}
    </Link>
  );
}

// "A (0.88) and B (0.87) have the highest F1, followed by C and D."
function Insight({ doc, task }) {
  const { metric, best } = uniqueEntries(doc, task);
  const [a, b, c, d] = best;
  if (!a) return null;
  const Icon = TASK_ICONS[task];
  const verb = metric.direction === "lower" ? "lowest" : "highest";
  const follow = [c, d].filter(Boolean);
  return (
    <div className="card-flat flex flex-col gap-3 p-4">
      <Link to={`/leaderboard/${task}`} className="inline-flex items-center gap-1.5 self-start rounded-full bg-base-300/50 px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary">
        <Icon size={13} className="text-primary" aria-hidden="true" /> {shortName(task)}
      </Link>
      <p className="text-sm leading-relaxed text-base-content/75">
        <Name e={a} /> ({a.label}){b && <> and <Name e={b} /> ({b.label})</>} {b ? "have" : "has"} the {verb} {metric.display_name}
        {follow.length > 0 && (
          <>
            , followed by{" "}
            {follow.map((e, i) => (
              <Fragment key={e.key}>
                {i > 0 && " and "}
                <Name e={e} />
              </Fragment>
            ))}
          </>
        )}
        .
      </p>
    </div>
  );
}

// A leader card: the model's real result on each core task, bar relative to the task's best.
function LeaderCard({ m, tasks, models, position }) {
  // Places come from the same comparison as the average rank, so the numbers
  // on this card agree with the comparison table further down.
  const rows = tasks.map((t) => {
    const cell = m.cells[t.id];
    const top = models.find((x) => x.cells[t.id]?.rank === 1)?.cells[t.id]?.value ?? null;
    return { task: t.id, metric: t.metric, mine: cell?.rank != null ? { value: cell.value } : null, top, place: cell?.rank ?? null, count: cell?.count };
  });
  return (
    <article className="card-flat card-lift flex flex-col">
      <div className="flex items-start gap-3 p-5 pb-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-base-300/70 bg-base-100">
          <ModelLogo model={m.model} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <Link to={`/models/${encodeURIComponent(m.id)}`} className="block truncate text-lg font-bold hover:text-primary">{m.name}</Link>
          <p className="text-xs text-base-content/55">{m.model?.org} · {formatParams(m.model)} parameters</p>
        </div>
        <span className="num rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">#{position}</span>
      </div>
      <ul className="flex flex-col gap-2.5 px-5 pb-4">
        {rows.map((r) => (
          <li key={r.task} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
            <span className="truncate text-base-content/70">{shortName(r.task)}</span>
            <span className="h-1.5 rounded-full bg-base-300/60" aria-hidden="true">
              {r.mine && r.top ? <span className="bar-grow block h-1.5 rounded-full bg-primary/80" style={{ width: `${Math.min(100, (r.metric.direction === "lower" ? r.top / r.mine.value : r.mine.value / r.top) * 100)}%` }} /> : null}
            </span>
            <span className="num w-[86px] text-right">
              {r.mine ? (
                <>
                  <span className="font-semibold">{formatNumber(r.mine.value, r.metric.unit)}</span>
                  <span className="ml-1 text-xs text-base-content/50">#{r.place}</span>
                </>
              ) : (
                <span className="text-xs text-base-content/45">Not measured</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between border-t border-base-300/60 px-5 py-3 text-xs text-base-content/60">
        <span>Average rank {m.avgRank.toFixed(1)} across {m.tasksRanked} tasks</span>
        <Link to={`/models/${encodeURIComponent(m.id)}`} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          Details <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

const TIER_LABEL = { tiny: "Up to 4B", small: "4B to 10B", medium: "10B to 35B", large: "Over 35B" };

function Compare({ doc, tasks, models }) {
  const complete = models.filter((m) => m.tasksRanked === tasks.length);
  const top = complete.slice(0, 12);
  const leadersByTask = tasks.map((t) => complete.find((m) => m.cells[t.id]?.rank === 1)).filter(Boolean);
  const distinctLeaders = new Set(leadersByTask.map((m) => m.id)).size;
  const points = complete.filter((m) => m.paramsB != null).map((m) => ({ id: m.id, name: m.name, size: m.paramsB, avgRank: m.avgRank, model: m.model }));
  const frontier = bestForSize(points);
  const smallBest = [...points].filter((p) => p.size <= 10).sort((a, b) => a.avgRank - b.avgRank)[0];
  const beaten = smallBest ? points.filter((p) => p.size > smallBest.size && p.avgRank > smallBest.avgRank).length : 0;
  const tiers = doc.tiers
    .map((tier) => ({ tier, best: complete.find((m) => m.tier === tier.id), count: complete.filter((m) => m.tier === tier.id).length }))
    .filter((x) => x.best);

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle sheet="02 / Comparison" title="How the models compare" lead={`The ${complete.length} models evaluated on all ${tasks.length} core tasks, side by side.`} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <article className="card-flat flex flex-col gap-3 p-5">
          <div>
            <div>
              <h3 className="font-bold leading-snug">
                {distinctLeaders > 1 ? `${distinctLeaders} different models lead the ${tasks.length} tasks` : `${leadersByTask[0]?.name} leads every task`}
              </h3>
              <p className="text-xs text-base-content/55">Place on each task for the top {top.length} by average rank, counted among the models evaluated with the ArchBench CLI.</p>
            </div>
          </div>
          <RankHeatmap models={top} tasks={tasks} />
        </article>
        <article className="card-flat flex flex-col gap-3 p-5">
          <div>
            <div>
              <h3 className="font-bold leading-snug">
                {smallBest ? `${smallBest.name} outranks ${beaten} larger models` : "Size against rank"}
              </h3>
              <p className="text-xs text-base-content/55">
                Model size against average rank. The line joins the {frontier.length} models that beat every smaller model.
              </p>
            </div>
          </div>
          <div className="min-h-[320px] flex-1">
            <SizeScatter points={points} />
          </div>
          <div className="mt-auto border-t border-base-300/60 pt-3">
            <p className="bp-label mb-2" aria-hidden="true">Best in each size class</p>
            <ul className="flex flex-col gap-1">
              {tiers.map(({ tier, best, count }) => (
                <li key={tier.id}>
                  <Link to={`/models/${encodeURIComponent(best.id)}`} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-base-300/40">
                    <span className="text-xs text-base-content/55">{TIER_LABEL[tier.id] ?? tier.label}</span>
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      <ModelLogo model={best.model} size={15} />
                      <span className="truncate">{best.name}</span>
                    </span>
                    <span className="num text-xs text-base-content/60">avg. rank {best.avgRank.toFixed(1)} <span className="text-base-content/40">of {count}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

function TaskCard({ doc, task }) {
  const Icon = TASK_ICONS[task];
  const { metric, entries } = taskEntries(doc, task, { prompt: "zero_shot" });
  const rows = entries.slice(0, 3).map((x) => ({ id: x.id, key: x.key, model: x.model, name: x.name, sub: x.note || undefined, value: x.value, label: x.label, rank: x.rank }));
  return (
    <article className="card-flat card-lift flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold leading-snug">{doc.tasks[task].name}</h3>
          <p className="mt-0.5 text-xs text-base-content/55">Ranked by {metric.display_name}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-base-content/65">{taskInfo(task).summary}</p>
      <div className="mt-3 border-t border-base-300/60 pt-2">
        <RankBars items={rows} />
      </div>
      <Link to={`/leaderboard/${task}`} className="mt-auto inline-flex items-center gap-1.5 self-start pt-3 text-sm font-medium text-primary hover:underline">
        Full leaderboard <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function Home() {
  const doc = useResults();
  const { tasks, models } = useMemo(() => overallStandings(doc, "zero_shot", shortName), [doc]);
  const allTasks = Object.keys(doc.tasks);
  const leaders = models.filter((m) => m.tasksRanked === tasks.length).slice(0, 3);
  const modelCount = new Set(doc.results.map((r) => r.model_id)).size;
  const asOf = doc.generatedAt ? new Date(doc.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <Page className="flex flex-col gap-12">
      <section className="pt-4 sm:pt-8">
        <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="block">LLM Leaderboard for</span>
          <BlueprintFrame className="mt-3 text-primary sm:mt-4">Software Architecture</BlueprintFrame>
        </h1>
        <p className="mt-8 max-w-[66ch] text-lg leading-relaxed text-base-content/75">
          {asOf ? `As of ${asOf}, ` : ""}ArchBench ranks {modelCount} models on {allTasks.length} software-architecture tasks, from writing
          architecture decision records to generating microservices. Select any model for its detailed results.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-3">
            <Link to="/leaderboard/adr" className="btn btn-primary rounded-xl px-5">
              <Trophy size={17} aria-hidden="true" /> Explore leaderboards
            </Link>
            <a href="https://arxiv.org/abs/2603.17833" target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl border-base-300 px-5">
              <FileText size={17} aria-hidden="true" /> Read the paper
            </a>
          </div>
          <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-base-content/60">
            {[[allTasks.length, "tasks"], [modelCount, "models"], [doc.results.length, "results"]].map(([n, label]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <dd className="num font-bold text-base-content">{n}</dd>
                <dt>{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-label="Highlights by task" className="-mx-4 bg-base-200/50 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {allTasks.map((t) => <Insight key={t} doc={doc} task={t} />)}
        </div>
      </section>

      {leaders.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle
            sheet="01 / Leaders"
            title="Current leaders"
            lead={`The models with the best average rank across the ${tasks.length} core tasks${asOf ? `, as of ${asOf}` : ""}. Bars compare each result with the best in the same comparison.`}
          >
            <Link to="/models" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All models <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </SectionTitle>
          <div className="grid gap-5 lg:grid-cols-3">
            {leaders.map((m, i) => <LeaderCard key={m.id} m={m} tasks={tasks} models={models} position={i + 1} />)}
          </div>
        </section>
      )}

      <Compare doc={doc} tasks={tasks} models={models} />

      <section className="flex flex-col gap-4">
        <SectionTitle sheet="03 / Tasks" title="Leaderboards by task" lead="The top three on each task. Open a task for the full ranking, every metric and the task definition." />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allTasks.map((t) => <TaskCard key={t} doc={doc} task={t} />)}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle sheet="04 / Updates" title="What's new" />
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {changelog.slice(0, 4).map((u) => (
            <li key={u.date + u.text} className="card-flat p-4 text-sm">
              <span className="num block text-xs text-base-content/50">{fmtDate(u.date)}</span>
              {u.to ? <Link to={u.to.replace("/tasks/", "/leaderboard/")} className="mt-1 block hover:text-primary">{u.text}</Link> : <a href={u.href} target="_blank" rel="noopener noreferrer" className="mt-1 block hover:text-primary">{u.text}</a>}
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
