import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { familyColor } from "../lib/colors";
import { defaultMetric, promptOf, rowsFor } from "../lib/results";
import { formatNumber, formatWithStd, humanize, meanOf, rankByMetric, setupLabel, stdOf } from "../lib/metrics";
import { defaultPrompt, formatParams, inhouseTasks, primaryMetric, promptStyles, tierLabel } from "../lib/views";
import { overallStandings } from "../lib/insights";
import { BoxTabs, Container, DirectionArrow, ExternalIcon, ModelLogo, PageBand, SectionTitle } from "../components/ui";
import NotFound from "./NotFound";


// One task: rank, score, and a strip of every in-house model with this one marked.
function TaskStrip({ doc, task, modelId, prompt, color }) {
  const metric = primaryMetric(doc, task);
  const ranked = rankByMetric(rowsFor(doc, task, { source: "inhouse", prompt }), metric.key, metric.direction);
  const mine = ranked.find((r) => r.row.model_id === modelId);
  if (!mine) return null;
  const values = ranked.map((r) => meanOf(r.row, metric.key)).filter((v) => v !== null);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pos = (v) => `${((metric.direction === "lower" ? 1 - (v - lo) / (hi - lo || 1) : (v - lo) / (hi - lo || 1)) * 100).toFixed(2)}%`;
  const value = meanOf(mine.row, metric.key);
  const shown = formatWithStd(value, stdOf(mine.row, metric.key), metric.unit);
  return (
    <li className="border-b border-base-300 last:border-0">
      <Link to={`/leaderboard/${task}`} className="flex flex-col gap-2 py-4 hover:bg-base-200/50">
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[15px]">{doc.tasks[task].name}</span>
          <span className="num text-[13px] text-base-content/70">Rank <strong className="text-base-content">{mine.rank ?? "–"}</strong> of {ranked.filter((r) => r.rank).length}</span>
        </span>
        <span className="flex justify-between text-[12.5px] text-base-content/60">
          <span>{metric.display_name}<DirectionArrow direction={metric.direction} /></span>
          <span className="num text-base-content">{shown.value}{shown.std && <span className="text-base-content/50"> ±{shown.std}</span>}</span>
        </span>
        <span className="relative block h-4" aria-hidden="true">
          <span className="absolute inset-x-0 top-[7px] h-px bg-base-300" />
          {ranked.filter((r) => r.row.model_id !== modelId && meanOf(r.row, metric.key) !== null).map((r) => (
            <span key={r.row.run_id} className="absolute top-1 -ml-1 h-2 w-2 rounded-full bg-base-content/25" style={{ left: pos(meanOf(r.row, metric.key)) }} />
          ))}
          <span className="absolute top-0 -ml-2 h-4 w-4 rounded-full ring-2 ring-base-100" style={{ left: pos(value), background: color }} />
        </span>
        <span className="num flex justify-between text-[11px] text-base-content/50">
          <span>Worst {formatNumber(metric.direction === "lower" ? hi : lo, metric.unit)}</span>
          <span>Best {formatNumber(metric.direction === "lower" ? lo : hi, metric.unit)}</span>
        </span>
      </Link>
    </li>
  );
}

function Table({ head, rows }) {
  return (
    <div className="card-flat overflow-x-auto">
      <table className="table table-sm">
        <thead><tr className="border-base-300 bg-base-200/60 text-[11.5px] text-base-content/60">{head.map((h, i) => <th key={h} className={i ? "text-right" : ""}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} className="border-base-300">{r.map((c, i) => <td key={i} className={i ? "num text-right" : ""}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
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
  const styles = promptStyles(inhouse).sort((a, b) => (a === "zero_shot" ? -1 : b === "zero_shot" ? 1 : 0));
  const active = styles.includes(prompt) ? prompt : defaultPrompt(styles);
  const color = familyColor(model?.family);
  const moe = model?.active_params_b != null && model.active_params_b !== model.params_b;
  const quant = inhouse[0]?.setup?.quantization?.replace(" (online)", "");
  const list = inhouse.length ? overallStandings(doc, "zero_shot", (id) => taskInfo(id).shortName).models : [];
  const i = list.findIndex((m) => m.id === modelId);
  const me = list[i];
  const byIndex = list.filter((m) => m.tasksRanked === Math.max(...list.map((x) => x.tasksRanked)));
  const indexPos = byIndex.findIndex((m) => m.id === modelId) + 1;

  const facts = [
    ["Parameters", model?.params_b != null ? (moe ? `${formatParams(model)} total, ${model.active_params_b}B active` : formatParams(model)) : "Not disclosed"],
    ["Size tier", model?.tier ? tierLabel(doc, model.tier) : "–"],
    ["Weights", model ? (model.open_weights ? "Open" : "Closed") : "–"],
  ];

  const rowsAt = inhouse.filter((r) => promptOf(r) === active);
  const setup = rowsAt[0]?.setup ?? {};

  return (
    <>
      <PageBand
        back={{ to: "/models", label: "All models" }}
        barTitle={model?.display_name ?? modelId}
        title={<span className="inline-flex items-center gap-3"><ModelLogo model={model} size={34} />{model?.display_name ?? modelId}</span>}
        lead={[model?.family && `${model.family} family`, model?.org, model?.params_b != null && `${formatParams(model)} parameters`, quant].filter(Boolean).join(" · ")}
        aside={
          me && (
            <div className="card-flat w-full p-5 lg:w-[320px]">
              <p className="text-[13px] text-base-content/60">Overall position</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="font-bold num text-[48px] leading-none">#{indexPos}</span>
                <span className="text-[13px] text-base-content/60">of {byIndex.length}, average rank {me.avgRank.toFixed(1)}</span>
              </p>
              <div className="mt-4 flex flex-col gap-1 border-t border-base-300 pt-3 text-[13px]">
                {[["Above", byIndex[indexPos - 2]], ["Below", byIndex[indexPos]]].map(([label, m]) =>
                  m ? (
                    <Link key={label} to={`/models/${encodeURIComponent(m.id)}`} className="flex items-center gap-2 py-1 hover:underline">
                      <span className="w-12 text-base-content/55">{label}</span>
                      <ModelLogo model={m.model} size={14} />
                      <span className="flex-1 truncate">{m.name}</span>
                      <span className="num text-base-content/55">{m.avgRank.toFixed(1)}</span>
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
          )
        }
      >
        <div className="card-flat mt-8 grid max-w-[960px] gap-5 p-5 text-[13px] sm:grid-cols-4 sm:p-6">
          {facts.map(([k, v]) => (
            <div key={k}>
              <p className="font-semibold">{k}</p>
              <p className="num mt-1 text-base-content/70">{v}</p>
            </div>
          ))}
          {model?.hf_id && (
            <a href={`https://huggingface.co/${model.hf_id}`} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex items-center gap-1 sm:col-span-4">
              {model.hf_id} on Hugging Face <ExternalIcon />
            </a>
          )}
        </div>
      </PageBand>

      <Container className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        {inhouse.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle title="Across tasks" lead="Each line shows every model on that task, with better results to the right. This model is the large dot.">
              {styles.length > 1 && <BoxTabs label="Prompt" value={active} onChange={setPrompt} options={styles.map((s) => ({ value: s, label: humanize(s) }))} />}
            </SectionTitle>
            <ul className="card-flat px-5">
              {tasks.map((t) => <TaskStrip key={t} doc={doc} task={t} modelId={modelId} prompt={active} color={color} />)}
            </ul>
          </section>
        )}
        {inhouse.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle title="Evaluation settings" lead="The settings this model was evaluated with on the tasks above." />
            <Table
              head={["Setting", "Value"]}
              rows={[
                ["Weights precision", quant],
                ["Temperature", setup.temperature],
                ["Maximum output length", setup.max_tokens ? `${setup.max_tokens.toLocaleString("en-US")} tokens` : null],
                ["Repeated runs per task", setup.seeds?.length],
                ["Reasoning mode", model?.reasoning ? (inhouse.some((r) => r.setup?.thinking_enabled === false) ? "Disabled for evaluation" : "Always on") : "Not supported"],
              ].filter(([, v]) => v != null && v !== "")}
            />
          </section>
        )}
      </Container>

      <Container className="mt-12">
        <SectionTitle title="All results" lead="Every result this model has on the benchmark, by task and setting." />
        <div className="mt-4">
          <Table
            head={["Task", "Setting", "Result", "Source"]}
            rows={mine
              .slice()
              .sort((a, b) => Object.keys(doc.tasks).indexOf(a.task) - Object.keys(doc.tasks).indexOf(b.task))
              .map((r) => {
                const m = defaultMetric(doc, r.task, [r]);
                const sd = m ? stdOf(r, m.key) : null;
                return [
                  <Link key="t" to={`/leaderboard/${r.task}`} className="hover:text-primary">{taskInfo(r.task).shortName}</Link>,
                  [setupLabel(r), r.setup?.variant ? humanize(r.setup.variant) : null].filter(Boolean).join(", ") || "–",
                  m ? `${m.display_name} ${formatNumber(meanOf(r, m.key), m.unit)}${sd ? ` ±${formatNumber(sd, m.unit)}` : ""}` : "–",
                  r.provenance?.link ? <a key="s" href={r.provenance.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.date?.slice(0, 4)}</a> : <span key="s" className="text-base-content/40">–</span>,
                ];
              })}
          />
        </div>
      </Container>
    </>
  );
}
