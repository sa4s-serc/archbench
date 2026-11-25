import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, HardDrive, RotateCcw, Unlock } from "lucide-react";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { formatParams } from "../lib/views";
import { taskEntries } from "../lib/insights";
import { TASK_ICONS } from "../lib/taskIcons";
import { Container, ModelLogo, SizeSlider, fitsSize } from "../components/ui";

const USES = {
  adr: ["Document architecture decisions", "Write Architecture Decision Records from design context"],
  traceability: ["Link documentation to code", "Recover trace links between architecture docs, models and code"],
  diagram: ["Draw architecture diagrams", "Generate architecture views from a repository summary"],
  serverless: ["Write serverless functions", "Implement FaaS functions from a specification"],
  dynamic: ["Build IoT services", "Generate IoT services from a request and data schema"],
  microservice: ["Generate microservices", "Build complete microservices from requirements"],
};

const IMPORTANCE = ["Not important", "Low importance", "Important", "Very important", "Essential"];
const SIZE_PREF = ["No preference", "Slight preference", "Prefer smaller", "Strongly prefer smaller", "Smallest possible"];
const STEPS = ["Use", "Requirements", "Priorities", "Results"];
const DEFAULTS = { tasks: [], openOnly: true, maxSize: Infinity, weights: {}, sizePref: 0 };

function Option({ selected, onClick, icon: Icon, title, detail, multi = true }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected ? "border-primary/50 bg-primary/10" : "border-base-300/70 bg-base-200/30 hover:border-base-content/25"
      }`}
    >
      {Icon && <Icon size={18} className={`mt-0.5 shrink-0 ${selected ? "text-primary" : "text-base-content/50"}`} aria-hidden="true" />}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {detail && <span className="mt-0.5 block text-xs text-base-content/60">{detail}</span>}
      </span>
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-primary-content" : "border-base-content/30"}`}>
        {selected && <Check size={12} strokeWidth={3} aria-hidden="true" />}
      </span>
    </button>
  );
}

function Importance({ label, detail, icon: Icon, value, onChange, labels }) {
  return (
    <div className="card-flat flex flex-col gap-3 p-4">
      <div className="flex items-start gap-2">
        {Icon && <Icon size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />}
        <div>
          <p className="text-sm font-semibold">{label}</p>
          {detail && <p className="text-xs text-base-content/60">{detail}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="self-end text-xs font-medium">{labels[value]}</span>
        <input type="range" min={0} max={4} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} aria-valuetext={labels[value]} className="range range-primary range-xs" />
      </div>
    </div>
  );
}

export default function Recommender() {
  const doc = useResults();
  const allTasks = Object.keys(doc.tasks);
  const [step, setStep] = useState(0);
  const [state, setState] = useState(DEFAULTS);
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const weightOf = (t) => state.weights[t] ?? 3;

  // Each task: every model's best entry and its standing among the models on that task.
  const standings = useMemo(() => {
    const out = {};
    for (const t of allTasks) {
      const { metric, entries } = taskEntries(doc, t, { prompt: "zero_shot" });
      const best = [];
      const seen = new Set();
      for (const e of entries) if (!seen.has(e.id)) { seen.add(e.id); best.push(e); }
      const n = best.length;
      out[t] = { metric, byModel: Object.fromEntries(best.map((e, i) => [e.id, { ...e, place: i + 1, of: n, share: n > 1 ? (n - 1 - i) / (n - 1) : 1 }])) };
    }
    return out;
  }, [doc, allTasks]);

  const results = useMemo(() => {
    const tasks = state.tasks;
    if (!tasks.length) return [];
    const ids = new Set(tasks.flatMap((t) => Object.keys(standings[t].byModel)));
    const sizes = [...ids].map((id) => doc.models[id]?.params_b).filter((v) => v != null);
    const logMin = Math.log(Math.min(...sizes, 1));
    const logMax = Math.log(Math.max(...sizes, 2));
    return [...ids]
      .map((id) => ({ id, model: doc.models[id], per: tasks.map((t) => ({ task: t, entry: standings[t].byModel[id] ?? null })) }))
      .filter((c) => c.per.every((p) => p.entry))
      .filter((c) => !state.openOnly || c.model?.open_weights)
      .filter((c) => !state.openOnly || fitsSize(c.model, state.maxSize))
      .map((c) => {
        const total = tasks.reduce((s, t) => s + weightOf(t), 0);
        const quality = total
          ? c.per.reduce((s, p) => s + p.entry.share * weightOf(p.task), 0) / total
          : c.per.reduce((s, p) => s + p.entry.share, 0) / tasks.length;
        const size = c.model?.params_b != null ? (Math.log(c.model.params_b) - logMin) / (logMax - logMin || 1) : 0.5;
        return { ...c, order: quality - state.sizePref * 0.12 * size };
      })
      .sort((a, b) => b.order - a.order)
      .slice(0, 10);
  }, [state, standings, doc]);

  const canContinue = step !== 0 || state.tasks.length > 0;
  const toggleTask = (t) => set({ tasks: state.tasks.includes(t) ? state.tasks.filter((x) => x !== t) : [...state.tasks, t] });

  return (
    <Container className="pb-16 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-base-300/70 pb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Model Recommender</h1>
        <p className="text-sm text-base-content/60">Recommendations from the leaderboard rankings for the tasks you choose</p>
      </div>

      <div className="mt-5 flex items-center gap-3 text-xs text-base-content/60">
        <span>Step {step + 1} of {STEPS.length}</span>
        <ol className="flex gap-1.5" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-base-300"}`}>
              <span className="sr-only">{s}{i === step ? " (current)" : ""}</span>
            </li>
          ))}
        </ol>
      </div>

      <div key={step} className="page-enter mt-6 min-h-[340px]">
        {step === 0 && (
          <section>
            <h2 className="text-lg font-bold">What will you use it for?</h2>
            <p className="text-sm text-base-content/60">Select one or more.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {allTasks.map((t) => (
                <Option key={t} icon={TASK_ICONS[t]} selected={state.tasks.includes(t)} onClick={() => toggleTask(t)} title={USES[t]?.[0] ?? doc.tasks[t].name} detail={USES[t]?.[1]} />
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="max-w-3xl">
            <h2 className="text-lg font-bold">Requirements</h2>
            <p className="text-sm text-base-content/60">How you plan to run the model.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Option multi={false} icon={HardDrive} selected={state.openOnly} onClick={() => set({ openOnly: true })} title="Run it myself" detail="Only models with downloadable weights" />
              <Option multi={false} icon={Unlock} selected={!state.openOnly} onClick={() => set({ openOnly: false, maxSize: Infinity })} title="Any model" detail="Includes commercial models used through an API" />
            </div>
            {state.openOnly && (
              <div className="card-flat mt-4 p-4">
                <p className="mb-2 text-sm font-semibold">Largest model your hardware can run</p>
                <SizeSlider value={state.maxSize} onChange={(v) => set({ maxSize: v })} />
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-lg font-bold">Set your priorities</h2>
            <p className="text-sm text-base-content/60">Move the sliders to set how much each factor matters.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {state.tasks.map((t) => (
                <Importance key={t} icon={TASK_ICONS[t]} label={USES[t]?.[0] ?? doc.tasks[t].name} detail={`Ranked by ${standings[t].metric.display_name}`} value={weightOf(t)} labels={IMPORTANCE} onChange={(v) => set({ weights: { ...state.weights, [t]: v } })} />
              ))}
              <Importance icon={HardDrive} label="Model size" detail="Prefer smaller models when results are close" value={state.sizePref} labels={SIZE_PREF} onChange={(v) => set({ sizePref: v })} />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold">Your criteria</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {state.tasks.map((t) => (
                  <span key={t} className="rounded-full border border-base-300/70 px-3 py-1">
                    {USES[t]?.[0]} <span className="text-base-content/55">· {IMPORTANCE[weightOf(t)].toLowerCase()}</span>
                  </span>
                ))}
                <span className="rounded-full border border-base-300/70 px-3 py-1">
                  {state.openOnly ? `Open weights${state.maxSize !== Infinity ? `, up to ${state.maxSize}B` : ""}` : "Any model"}
                </span>
                {state.sizePref > 0 && <span className="rounded-full border border-base-300/70 px-3 py-1">{SIZE_PREF[state.sizePref]}</span>}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">Top recommendations</h2>
              {results.length === 0 ? (
                <p className="mt-2 text-sm text-base-content/65">
                  No model has results on all of the chosen tasks with these requirements. Try allowing any model, a larger size, or
                  fewer tasks.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-2xl border border-base-300/50">
                  <table className="table table-sm min-w-[720px]">
                    <thead>
                      <tr className="border-base-300/50 bg-base-200/50 text-[11.5px] text-base-content/60">
                        <th className="w-10">#</th>
                        <th>Model</th>
                        {state.tasks.map((t) => (
                          <th key={t} className="text-right">{taskInfo(t).shortName}<span className="block font-normal text-base-content/50">{standings[t].metric.display_name}</span></th>
                        ))}
                        <th className="text-right">Size</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((c, i) => (
                        <tr key={c.id} className="row-in border-base-300/50" style={{ animationDelay: `${i * 35}ms` }}>
                          <td>
                            <span className={`num inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${i === 0 ? "bg-primary text-primary-content" : i < 3 ? "bg-primary/15 text-primary" : "text-base-content/55"}`}>{i + 1}</span>
                          </td>
                          <th className="font-normal">
                            <span className="flex items-center gap-2">
                              <ModelLogo model={c.model} size={18} />
                              <span>
                                <span className="block font-semibold">{c.model?.display_name ?? c.id}</span>
                                <span className="block text-xs text-base-content/55">{c.model?.org}{c.model?.open_weights ? "" : " · commercial"}</span>
                              </span>
                            </span>
                          </th>
                          {c.per.map(({ task, entry }) => (
                            <td key={task} className="num text-right">
                              <span className="font-semibold">{entry.label}</span>
                              <span className="block text-xs text-base-content/50">#{entry.place} of {entry.of}</span>
                            </td>
                          ))}
                          <td className="num text-right">{c.model?.params_b != null ? formatParams(c.model) : "–"}</td>
                          <td className="text-right">
                            <Link to={`/models/${encodeURIComponent(c.id)}`} className="btn btn-xs btn-outline gap-1 rounded-lg border-base-300">
                              Model <ArrowUpRight size={12} aria-hidden="true" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-xs text-base-content/55">
                Only models with results on every chosen task are listed. Ranks are each model&apos;s place on that task&apos;s leaderboard.
              </p>
            </div>
          </section>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-base-300/70 pt-4">
        {step === 0 ? (
          <button type="button" onClick={() => set(DEFAULTS)} className="btn btn-sm btn-ghost gap-1.5 rounded-xl">
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
        ) : (
          <button type="button" onClick={() => setStep(step - 1)} className="btn btn-sm btn-outline gap-1.5 rounded-xl border-base-300">
            <ArrowLeft size={14} aria-hidden="true" /> {step === 3 ? "Adjust" : "Back"}
          </button>
        )}
        {step < 3 ? (
          <button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)} className="btn btn-sm btn-primary gap-1.5 rounded-xl">
            {step === 2 ? "See recommendations" : "Continue"} <ArrowRight size={14} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={() => { set(DEFAULTS); setStep(0); }} className="btn btn-sm btn-ghost gap-1.5 rounded-xl">
            <RotateCcw size={14} aria-hidden="true" /> Start over
          </button>
        )}
      </div>
    </Container>
  );
}
