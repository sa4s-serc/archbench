import { useState } from "react";
import { Link } from "react-router-dom";
import { formatWithStd, meanOf, rankByMetric, stdOf, setupLabel, humanize, DIRECTION_LABEL } from "../../lib/metrics";
import { DirectionArrow, ExternalIcon, FamilyDot } from "../ui";

/**
 * Every metric for a set of rows. Clicking a header sorts by that metric,
 * best first, using the metric's own direction. Ranks appear only when the
 * group is rankable (in-house) and the sort metric has a direction.
 */
export default function ResultsTable({ rows, metrics, models, ranked, initialSort, label }) {
  const [sortKey, setSortKey] = useState(initialSort ?? metrics[0]?.key);
  const sortMetric = metrics.find((m) => m.key === sortKey) ?? metrics[0];
  const ordered = sortMetric ? rankByMetric(rows, sortMetric.key, sortMetric.direction) : rows.map((row) => ({ row, rank: null }));
  const showRank = ranked && sortMetric && sortMetric.direction !== "none";

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">{label}. Sorted by {sortMetric?.display_name}; activate a column header to sort by it.</caption>
        <thead>
          <tr className="border-b border-line bg-surface text-left text-xs text-ink-2">
            {showRank && <th scope="col" className="w-10 px-3 py-2.5 font-medium">#</th>}
            <th scope="col" className="sticky left-0 bg-surface px-3 py-2.5 font-medium">Model</th>
            {!ranked && <th scope="col" className="px-3 py-2.5 font-medium">Setup</th>}
            {metrics.map((m) => {
              const active = m.key === sortMetric?.key;
              return (
                <th
                  key={m.key}
                  scope="col"
                  aria-sort={active ? (m.direction === "lower" ? "ascending" : "descending") : undefined}
                  className="px-3 py-2.5 text-right font-medium"
                >
                  <button
                    type="button"
                    onClick={() => setSortKey(m.key)}
                    title={DIRECTION_LABEL[m.direction]}
                    className={`num whitespace-nowrap rounded px-1 py-0.5 ${active ? "text-ink" : "hover:text-ink"}`}
                  >
                    {m.display_name}
                    <DirectionArrow direction={m.direction} />
                  </button>
                </th>
              );
            })}
            {!ranked && <th scope="col" className="px-3 py-2.5 font-medium">Source</th>}
          </tr>
        </thead>
        <tbody>
          {ordered.map(({ row, rank }) => {
            const model = models[row.model_id];
            const setup = [setupLabel(row), row.setup?.variant ? humanize(row.setup.variant) : null].filter(Boolean).join(", ");
            return (
              <tr key={row.run_id} className="border-b border-line last:border-b-0 hover:bg-surface">
                {showRank && <td className="num px-3 py-2.5 text-ink-2">{rank ?? "–"}</td>}
                <th scope="row" className="sticky left-0 bg-page px-3 py-2.5 text-left font-medium">
                  <Link to={`/models/${encodeURIComponent(row.model_id)}`} className="flex items-center gap-2 hover:text-accent">
                    {ranked && <FamilyDot family={model?.family} />}
                    <span className="whitespace-nowrap">{model?.display_name ?? row.model_id}</span>
                  </Link>
                </th>
                {!ranked && <td className="whitespace-nowrap px-3 py-2.5 text-ink-2">{setup || "–"}</td>}
                {metrics.map((m) => {
                  const shown = formatWithStd(meanOf(row, m.key), stdOf(row, m.key), m.unit);
                  const nonFinite = row.metrics?.[m.key]?.non_finite;
                  return (
                    <td key={m.key} className="num whitespace-nowrap px-3 py-2.5 text-right">
                      {shown.value}
                      {shown.std && <span className="text-xs text-ink-3"> ±{shown.std}</span>}
                      {nonFinite > 0 && <sup className="text-ink-3" title={`${nonFinite} non-finite value left out`}>*</sup>}
                    </td>
                  );
                })}
                {!ranked && (
                  <td className="px-3 py-2.5">
                    {row.provenance?.link ? (
                      <a href={row.provenance.link} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 whitespace-nowrap">
                        {row.date?.slice(0, 4)}
                        <ExternalIcon size={12} />
                      </a>
                    ) : (
                      <span className="text-ink-3">{row.date?.slice(0, 4)}</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
