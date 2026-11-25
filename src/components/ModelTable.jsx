import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import { taskInfo } from "../data/taskInfo";
import { familiesInUse } from "../lib/colors";
import { formatNumber } from "../lib/metrics";
import { formatParams } from "../lib/views";
import { overallStandings, taskEntries } from "../lib/insights";
import { ModelLogo, SizeSlider, fitsSize } from "./ui";

const shortName = (id) => taskInfo(id).shortName;

// Every model on the benchmark in one sortable, filterable table.
export default function ModelTable({ doc, prompt = "zero_shot" }) {
  const { models } = useMemo(() => overallStandings(doc, prompt, shortName), [doc, prompt]);
  const [sort, setSort] = useState({ key: "rank", desc: false });
  const [query, setQuery] = useState("");
  const [maxSize, setMaxSize] = useState(Infinity);
  const [family, setFamily] = useState("all");

  // Best entry per model on each task, all sources, for the chosen prompt.
  const scores = useMemo(() => {
    const out = {};
    for (const t of Object.keys(doc.tasks)) {
      const view = taskEntries(doc, t, { prompt });
      const byModel = {};
      for (const e of view.entries) if (!(e.id in byModel)) byModel[e.id] = e.value;
      out[t] = { metric: view.metric, best: view.entries[0]?.value ?? null, byModel };
    }
    return out;
  }, [doc, prompt]);
  const taskIds = Object.keys(doc.tasks);

  // Models with a result on any task but not on all of them have no overall score.
  const rows = useMemo(() => {
    const listed = new Set(models.map((m) => m.id));
    const extra = [...new Set(doc.results.map((r) => r.model_id))]
      .filter((id) => !listed.has(id))
      .map((id) => ({ id, model: doc.models[id], name: doc.models[id]?.display_name ?? id, family: doc.models[id]?.family, tier: null, index: null, paramsB: doc.models[id]?.params_b ?? null }));
    return [...models, ...extra];
  }, [models, doc]);

  const columns = [
    { key: "rank", label: "Avg. rank", sub: "core tasks", value: (m) => (m.index == null ? null : m.avgRank), desc: false },
    { key: "params", label: "Size", sub: "parameters", value: (m) => m.paramsB, desc: false },
    ...taskIds.map((t) => ({ key: t, label: shortName(t), sub: scores[t].metric.display_name, value: (m) => scores[t].byModel[m.id] ?? null, desc: scores[t].metric.direction !== "lower", task: t })),
  ];

  const col = columns.find((c) => c.key === sort.key) ?? columns[0];
  const shown = rows
    .filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()) || (m.model?.org ?? "").toLowerCase().includes(query.trim().toLowerCase()))
    .filter((m) => fitsSize(m.model, maxSize))
    .filter((m) => family === "all" || m.family === family)
    .sort((a, b) => {
      if ((a.index == null) !== (b.index == null)) return a.index == null ? 1 : -1;
      const va = col.value(a);
      const vb = col.value(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      return (va - vb) * (sort.desc ? -1 : 1);
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-base-300/50">
      <div className="flex flex-wrap items-end gap-3 border-b border-base-300/50 bg-base-200/50 p-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models or organisations"
          aria-label="Search models"
          className="input input-sm input-bordered w-full max-w-xs rounded-lg"
        />
        <SizeSlider value={maxSize} onChange={setMaxSize} className="w-full sm:w-60" />
        <select aria-label="Family" value={family} onChange={(e) => setFamily(e.target.value)} className="select select-sm select-bordered rounded-lg">
          <option value="all">All families</option>
          {familiesInUse(rows.map((m) => m.family).filter(Boolean)).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <span className="ml-auto text-[12.5px] text-base-content/60">{shown.length} of {rows.length} models</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm min-w-[1000px]">
          <thead>
            <tr className="border-base-300/50 bg-base-200/50 text-[11.5px] text-base-content/60">
              <th className="w-10">#</th>
              <th>Model</th>
              {columns.map((c) => {
                const active = c.key === sort.key;
                const Icon = sort.desc ? ArrowDown : ArrowUp;
                return (
                  <th key={c.key} aria-sort={active ? (sort.desc ? "descending" : "ascending") : undefined} className="text-right align-bottom">
                    <button type="button" onClick={() => setSort(active ? { key: c.key, desc: !sort.desc } : { key: c.key, desc: c.desc })} className={`inline-flex flex-col items-end font-medium ${active ? "text-base-content" : "hover:text-base-content"}`}>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        {c.label}
                        {active && <Icon size={11} aria-hidden="true" />}
                      </span>
                      {c.sub && <span className="whitespace-nowrap font-normal text-base-content/50">{c.sub}</span>}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((m, i) => (
              <Fragment key={m.id}>
              {m.index == null && (i === 0 || shown[i - 1].index != null) && (
                <tr className="border-base-300/50 bg-base-200/40">
                  <td colSpan={2 + columns.length} className="py-2 text-xs text-base-content/60">
                    Evaluated on some tasks only, so no average rank
                  </td>
                </tr>
              )}
              <tr className="border-base-300/50 hover:bg-base-200/30">
                <td className="num text-base-content/55">{m.index == null ? "" : m.position}</td>
                <th className="font-normal">
                  <Link to={`/models/${encodeURIComponent(m.id)}`} className="flex flex-col hover:underline">
                    <span className="flex items-center gap-2 text-[13.5px] font-medium"><ModelLogo model={m.model} size={16} />{m.name}</span>
                    <span className="pl-6 text-[11.5px] text-base-content/55">{m.model?.org}</span>
                  </Link>
                </th>
                <td className="num text-right font-semibold">{m.index == null ? <span className="font-normal text-base-content/30">–</span> : m.avgRank.toFixed(1)}</td>
                <td className="num text-right text-base-content/75">{formatParams(m.model)}</td>
                {taskIds.map((t) => {
                  const v = scores[t].byModel[m.id];
                  const best = v != null && v === scores[t].best;
                  return (
                    <td key={t} className={`num text-right ${best ? "font-bold text-primary" : ""}`}>
                      {v == null ? <span className="text-base-content/30">–</span> : formatNumber(v, scores[t].metric.unit)}
                    </td>
                  );
                })}
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p className="p-6 text-center text-[14px] text-base-content/60">No models match these filters.</p>}
    </div>
  );
}
