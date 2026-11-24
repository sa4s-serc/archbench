import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, Link2 } from "lucide-react";
import { DIRECTION_LABEL, formatWithStd, meanOf, rankByMetric, stdOf } from "../../lib/metrics";
import { ModelLogo } from "../ui";

const noteOf = (row) => {
  const a = row.setup?.approach;
  if (!a) return "";
  return a === "fine_tuned" ? "Fine-tuned" : a;
};

// Where a result comes from: its source paper when it has one, otherwise the
// model's own page.
const sourceOf = (row, model) => {
  if (row.provenance?.link) return { href: row.provenance.link, title: `Source${row.date ? `, ${row.date.slice(0, 4)}` : ""}` };
  if (model?.hf_id) return { href: `https://huggingface.co/${model.hf_id}`, title: `${model.display_name} on Hugging Face` };
  return null;
};

function Value({ row, metric }) {
  const shown = formatWithStd(meanOf(row, metric.key), stdOf(row, metric.key), metric.unit);
  return (
    <>
      {shown.value}
      {shown.std && <span className="text-[11px] font-normal text-base-content/50"> ±{shown.std}</span>}
    </>
  );
}

/**
 * The task leaderboard in one table. The metric it is ranked by sits next to
 * the model name with a bar; every other metric follows. Sorting is controlled
 * by the page: select a header to rank by it, select it again to reverse.
 */
export default function ResultsTable({ rows, metrics, models, sortKey, reversed, onSort, label }) {
  const sortMetric = metrics.find((m) => m.key === sortKey) ?? metrics[0];
  const others = metrics.filter((m) => m.key !== sortMetric?.key);
  const ranked = sortMetric ? rankByMetric(rows, sortMetric.key, sortMetric.direction) : rows.map((row) => ({ row, rank: null }));
  const withValue = ranked.filter((r) => r.rank !== null);
  const without = ranked.filter((r) => r.rank === null);
  const ordered = [...(reversed ? [...withValue].reverse() : withValue), ...without];

  // Bar scale: from zero, or zoomed to the observed band when every value is
  // close together (otherwise all bars look the same length).
  const values = withValue.map((r) => meanOf(r.row, sortMetric.key)).filter((v) => v != null);
  const hi = values.length ? Math.max(...values) : 0;
  const lo = values.length ? Math.min(...values) : 0;
  const zoomed = values.length > 3 && hi > 0 && (hi - lo) / hi < 0.15;
  const floor = zoomed ? lo - (hi - lo) * 0.12 : Math.min(0, lo);
  const pct = (v) => (hi > floor ? Math.max(2, ((v - floor) / (hi - floor)) * 100) : 100);

  const header = (m, wide = false) => {
    const active = m.key === sortMetric?.key;
    const bestFirst = !reversed;
    const ascending = (m.direction === "lower") === bestFirst;
    const Icon = !active ? ArrowUpDown : ascending ? ArrowUp : ArrowDown;
    return (
      <th key={m.key} className={wide ? "min-w-[240px]" : "text-right"} aria-sort={active ? (ascending ? "ascending" : "descending") : undefined}>
        <button
          type="button"
          onClick={() => onSort(m.key)}
          title={`${DIRECTION_LABEL[m.direction]}. ${active ? "Select to reverse the order." : "Select to rank by this metric."}`}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "hover:text-base-content"}`}
        >
          {m.display_name}
          <Icon size={11} className={active ? "" : "opacity-50"} aria-hidden="true" />
        </button>
      </th>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-base-300/50">
        <table className="table table-sm min-w-[720px]">
          <caption className="sr-only">
            {label}. Ranked by {sortMetric?.display_name}, {reversed ? "worst" : "best"} first. Select a column header to change.
          </caption>
          <thead>
            <tr className="border-base-300/50 bg-base-200/50 text-[11.5px] text-base-content/60">
              <th className="w-10">#</th>
              <th>Model</th>
              {sortMetric && header(sortMetric, true)}
              {others.map((m) => header(m))}
            </tr>
          </thead>
          <tbody>
            {ordered.map(({ row, rank }, i) => {
              const model = models[row.model_id];
              const v = sortMetric ? meanOf(row, sortMetric.key) : null;
              const note = noteOf(row);
              const src = sourceOf(row, model);
              return (
                <tr key={row.run_id} className="row-in border-base-300/50 hover:bg-base-200/40" style={{ animationDelay: `${Math.min(i, 24) * 16}ms` }}>
                  <td className={`num ${rank === 1 ? "font-bold text-primary" : "text-base-content/55"}`}>{rank ?? "–"}</td>
                  <th className="font-normal">
                    <span className="flex items-center gap-2">
                      <Link to={`/models/${encodeURIComponent(row.model_id)}`} className="flex items-center gap-2 hover:text-primary">
                        <ModelLogo model={model} size={16} />
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap font-medium">{model?.display_name ?? row.model_id}</span>
                          {note && <span className="block whitespace-nowrap text-[11px] text-base-content/50">{note}</span>}
                        </span>
                      </Link>
                      {src && (
                        <a href={src.href} target="_blank" rel="noopener noreferrer" title={src.title} aria-label={src.title} className="shrink-0 rounded p-0.5 text-base-content/40 hover:bg-primary/10 hover:text-primary">
                          <Link2 size={13} aria-hidden="true" />
                        </a>
                      )}
                    </span>
                  </th>
                  {sortMetric && (
                    <td className="bg-primary/5">
                      <span className="flex items-center gap-3">
                        <span className="h-2 flex-1 rounded-full bg-base-300/60" aria-hidden="true">
                          {v != null && (
                            <span
                              className={`bar-grow block h-2 rounded-full ${rank === 1 ? "bg-primary" : "bg-primary/50"}`}
                              style={{ width: `${pct(v)}%`, animationDelay: `${Math.min(i, 24) * 20}ms` }}
                            />
                          )}
                        </span>
                        <span className="num w-[92px] shrink-0 whitespace-nowrap text-right font-semibold">
                          {v != null ? <Value row={row} metric={sortMetric} /> : <span className="font-normal text-base-content/40">–</span>}
                        </span>
                      </span>
                    </td>
                  )}
                  {others.map((m) => (
                    <td key={m.key} className="num whitespace-nowrap text-right text-base-content/80">
                      {meanOf(row, m.key) != null ? <Value row={row} metric={m} /> : <span className="text-base-content/40">–</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {zoomed && (
        <p className="mt-2 text-xs text-base-content/55">Scores are close together, so bars show where each one sits between the lowest and the highest.</p>
      )}
    </div>
  );
}
