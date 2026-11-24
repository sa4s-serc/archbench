import { Link } from "react-router-dom";
import { ModelLogo } from "../ui";

/**
 * Ranked horizontal bars: rank, provider logo, name, a bar from zero and the
 * value. The leader's bar is solid purple, the rest a lighter purple; results
 * from papers are grey and carry no rank. A thin line on the bar shows the
 * spread between runs when there is one.
 * items: [{ id, key?, model, name, sub?, value, spread?, label, rank? }] best first.
 */
export default function RankBars({ items, tone = "ours", max: fixedMax, showRank = true, linkModels = true }) {
  const values = items.map((d) => d.value).filter((v) => v != null);
  const hi = fixedMax ?? (Math.max(...items.map((d) => (d.value ?? 0) + (d.spread ?? 0)), 0) || 1);
  const minV = values.length ? Math.min(...values) : 0;
  const maxV = values.length ? Math.max(...values) : 0;
  // When every score sits within a narrow band, zero-based bars all look the
  // same length. Then the bars show position between the lowest and highest.
  const zoomed = fixedMax == null && items.length > 3 && maxV > 0 && (maxV - minV) / maxV < 0.15;
  const lo = zoomed ? minV - (maxV - minV) * 0.12 : 0;
  const pct = (v) => `${Math.max(0, Math.min(100, ((v - lo) / ((zoomed ? maxV : hi) - lo || 1)) * 100))}%`;
  return (
    <>
    <ol className="flex flex-col">
      {items.map((d, i) => {
        const lead = tone === "ours" && (d.rank != null ? d.rank === 1 : i === 0);
        const bar = tone === "papers" ? "bg-base-content/25" : lead ? "bg-primary" : "bg-primary/45";
        const Row = linkModels ? Link : "div";
        return (
          <li key={d.key ?? d.id} className="row-in" style={{ animationDelay: `${Math.min(i, 20) * 22}ms` }}>
            <Row
              {...(linkModels ? { to: `/models/${encodeURIComponent(d.id)}` } : {})}
              className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg px-2 py-1.5 hover:bg-base-200/70 sm:grid-cols-[26px_minmax(0,220px)_minmax(0,1fr)_92px]"
            >
              <span className={`num text-right text-xs ${lead ? "font-bold text-primary" : "text-base-content/45"}`}>{showRank ? d.rank ?? i + 1 : ""}</span>
              <span className="flex min-w-0 items-center gap-2">
                <ModelLogo model={d.model} size={16} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{d.name}</span>
                  {d.sub && <span className="block truncate text-[11px] text-base-content/50">{d.sub}</span>}
                </span>
              </span>
              <span className="relative col-span-3 row-start-2 h-2 rounded-full bg-base-300/60 sm:col-span-1 sm:col-start-3 sm:row-start-1" aria-hidden="true">
                <span className={`bar-grow absolute inset-y-0 left-0 rounded-full ${bar}`} style={{ width: pct(d.value ?? 0), animationDelay: `${Math.min(i, 20) * 28}ms` }} />
                {d.spread > 0 && (
                  <span
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-base-content/50"
                    style={{ left: pct(Math.max(0, d.value - d.spread)), width: `calc(${pct(d.value + d.spread)} - ${pct(Math.max(0, d.value - d.spread))})` }}
                  />
                )}
              </span>
              <span className="num text-right text-[13px] font-semibold sm:col-start-4 sm:row-start-1">{d.label}</span>
            </Row>
          </li>
        );
      })}
    </ol>
    {zoomed && (
      <p className="mt-2 px-2 text-xs text-base-content/55">
        Scores are close together, so bars show where each one sits between the lowest and the highest.
      </p>
    )}
    </>
  );
}
