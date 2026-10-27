import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { familyColor } from "../../lib/colors";
import { meanOf, rankByMetric, stdOf, formatWithStd, setupLabel, DIRECTION_LABEL } from "../../lib/metrics";
import { FamilyDot } from "../ui";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const MOTION = { duration: 0.32, ease: EASE_OUT_EXPO };

// Bar domain shared by every group on a page, so lengths compare honestly:
// from zero (or a negative minimum) to a little past the largest value.
export function barDomain(metric, rowGroups) {
  const values = rowGroups.flat().map((r) => meanOf(r, metric.key)).filter((v) => v !== null);
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  const bounded = metric.range && metric.range[1] === 1 && hi <= 1;
  return [lo, (bounded ? Math.min(1, hi * 1.08) : hi * 1.08) || 1];
}

const position = (value, [lo, hi]) => ((value - lo) / (hi - lo)) * 100;
const pct = (value, domain) => `${position(value, domain).toFixed(3)}%`;

function niceStep(raw) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
}

function ticksFor([lo, hi], unit) {
  const step = niceStep((hi - lo) / 4);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
    const value = Number(v.toPrecision(6));
    ticks.push({ value, label: unit === "percent" ? `${value.toFixed(0)}%` : value.toFixed(decimals) });
  }
  return ticks;
}

/**
 * One group of horizontal bars, best first.
 * ranked: the in-house group, with rank numbers and family colour.
 * Unranked groups (paper results) draw outlined bars and carry no rank.
 */
export default function RankedBars({ rows, metric, models, ranked, domain, label }) {
  const ordered = rankByMetric(rows, metric.key, metric.direction);
  const ticks = ticksFor(domain, metric.unit);
  // Phones: name and value on one line, the bar full width below it.
  // Wider screens: one row per model with the bar between name and value.
  const columns = ranked
    ? "grid-cols-[24px_minmax(0,1fr)_auto] sm:grid-cols-[24px_minmax(112px,200px)_minmax(0,1fr)_minmax(96px,auto)]"
    : "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(132px,280px)_minmax(0,1fr)_minmax(72px,auto)]";
  const barPlacement = ranked ? "col-start-2 col-span-2 sm:col-start-3 sm:col-span-1 sm:row-start-1" : "col-span-2 sm:col-start-2 sm:col-span-1 sm:row-start-1";
  const valuePlacement = ranked ? "col-start-3 row-start-1 sm:col-start-4" : "col-start-2 row-start-1 sm:col-start-3";

  return (
    <div>
      <div>
        <div aria-hidden="true" className={`hidden ${columns} gap-3 pb-2 text-xs text-ink-3 sm:grid`}>
          {ranked && <span>#</span>}
          <span>{ranked ? "Model" : "Model and setup"}</span>
          <span className="relative h-4">
            {ticks.map((t) => (
              <span key={t.value} className="num absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pct(t.value, domain) }}>
                {t.label}
              </span>
            ))}
          </span>
          <span className="text-right">{ranked ? "Mean ± sd" : "Reported"}</span>
        </div>
        <ol aria-label={label}>
          {ordered.map(({ row, rank }) => {
            const model = models[row.model_id];
            const name = model?.display_name ?? row.model_id;
            const value = meanOf(row, metric.key);
            const std = stdOf(row, metric.key);
            const shown = formatWithStd(value, std, metric.unit);
            const setup = setupLabel(row);
            const selfReported = row.metrics?.[metric.key]?.self_reported === true;
            const spoken = [
              ranked && rank ? `Rank ${rank}` : null,
              name,
              !ranked && setup ? setup : null,
              `${metric.display_name} ${shown.value}${shown.std ? ` plus or minus ${shown.std}` : ""}`,
              selfReported ? "self-reported" : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <motion.li layout="position" transition={MOTION} key={row.run_id}>
                <Link
                  to={`/models/${encodeURIComponent(row.model_id)}`}
                  aria-label={spoken}
                  className={`grid ${columns} min-h-[36px] items-center gap-x-3 border-t border-line py-1.5 text-ink transition-colors duration-150 hover:bg-surface sm:py-1`}
                >
                  {ranked && <span className="num text-[13px] text-ink-2">{rank ?? "–"}</span>}
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    {ranked && <FamilyDot family={model?.family} />}
                    <span className="truncate font-medium">{name}</span>
                    {!ranked && setup && <span className="truncate text-[13px] text-ink-2">{setup}</span>}
                  </span>
                  <span className={`relative h-6 sm:h-8 ${barPlacement}`} aria-hidden="true">
                    {ticks.map((t) => (
                      <span key={t.value} className="absolute inset-y-0 w-px bg-grid" style={{ left: pct(t.value, domain) }} />
                    ))}
                    {value !== null && (
                      <motion.span
                        className="absolute left-0 top-[5px] h-[14px] rounded-r sm:top-[9px]"
                        style={{ background: ranked ? familyColor(model?.family) : "var(--ink-3)" }}
                        initial={{ width: 0 }}
                        animate={{ width: pct(value, domain) }}
                        transition={MOTION}
                      />
                    )}
                    {value !== null && std !== null && (
                      <span
                        className="absolute top-[11px] h-[2px] bg-ink opacity-60 sm:top-[15px]"
                        style={{
                          left: pct(Math.max(domain[0], value - std), domain),
                          width: `${(position(value + std, domain) - position(Math.max(domain[0], value - std), domain)).toFixed(3)}%`,
                        }}
                      />
                    )}
                  </span>
                  <span className={`num text-right text-sm ${valuePlacement}`}>
                    {shown.value}
                    {shown.std && <span className="text-xs text-ink-3"> ±{shown.std}</span>}
                    {selfReported && <span className="text-xs text-ink-3"> self-reported</span>}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export const directionSentence = (metric) =>
  metric.direction === "none" ? DIRECTION_LABEL.none : `${DIRECTION_LABEL[metric.direction]}. Best first.`;
