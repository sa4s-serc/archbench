import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useParentSize } from "@visx/responsive";
import { scaleLinear, scaleLog } from "@visx/scale";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { familyColor } from "../../lib/colors";
import { formatNumber } from "../../lib/metrics";

const MARGIN = { top: 16, right: 24, bottom: 44, left: 52 };
const CHAR_W = 6.7; // approximate width of a 12px Plex character
const LABEL_H = 14;

const median = (values) => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

// Models that no model with a smaller x beats on y.
export function paretoFrontier(points, direction) {
  const better = (a, b) => (direction === "lower" ? a < b : a > b);
  const sorted = [...points].sort((a, b) => a.x - b.x || (direction === "lower" ? a.y - b.y : b.y - a.y));
  const frontier = [];
  for (const p of sorted) {
    if (!frontier.length || better(p.y, frontier[frontier.length - 1].y)) frontier.push(p);
  }
  return frontier;
}

// Greedy label placement: try right, left, above, below; skip a side that
// overlaps an earlier label or a point.
function placeLabels(points, xScale, yScale, width, height) {
  const boxes = points.map((p) => ({ x: xScale(p.x) - 6, y: yScale(p.y) - 6, w: 12, h: 12 }));
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const placed = {};
  const order = [...points].sort((a, b) => b.y - a.y);
  for (const p of order) {
    const cx = xScale(p.x);
    const cy = yScale(p.y);
    const w = p.name.length * CHAR_W;
    const candidates = [
      { x: cx + 10, y: cy - LABEL_H / 2, anchor: "start" },
      { x: cx - 10 - w, y: cy - LABEL_H / 2, anchor: "end" },
      { x: cx - w / 2, y: cy - 10 - LABEL_H, anchor: "middle-above" },
      { x: cx - w / 2, y: cy + 10, anchor: "middle-below" },
    ];
    const fits = (c) =>
      c.x >= 0 && c.x + w <= width && c.y >= 0 && c.y + LABEL_H <= height &&
      !boxes.some((b) => overlaps({ x: c.x, y: c.y, w, h: LABEL_H }, b));
    const choice = candidates.find(fits);
    if (choice) {
      boxes.push({ x: choice.x, y: choice.y, w, h: LABEL_H });
      placed[p.id] = choice;
    }
  }
  return placed;
}

function niceLogTicks([lo, hi]) {
  const out = [];
  for (let e = Math.floor(Math.log2(lo)); e <= Math.ceil(Math.log2(hi)); e++) {
    const v = 2 ** e;
    if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v);
  }
  return out.length > 7 ? out.filter((_, i) => i % 2 === 0) : out;
}

function Chart({ width, points, metric, xAxis }) {
  const navigate = useNavigate();
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, showTooltip, hideTooltip } = useTooltip();
  const height = Math.round(Math.min(480, Math.max(320, width * 0.52)));
  const innerW = Math.max(10, width - MARGIN.left - MARGIN.right);
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const { xScale, yScale, frontier, quadrant, labels, xTicks, yTicks } = useMemo(() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xDomain = [Math.min(...xs) / 1.4, Math.max(...xs) * 1.4];
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.12 || 0.05;
    const yScale = scaleLinear({ domain: [Math.min(...ys) - pad, Math.max(...ys) + pad], range: [innerH, 0], nice: true });
    const xScale = scaleLog({ domain: xDomain, range: [0, innerW] });
    const medX = median(xs);
    const medY = median(ys);
    const quadrant = {
      x: 0,
      w: xScale(medX),
      y: metric.direction === "lower" ? yScale(medY) : 0,
      h: metric.direction === "lower" ? innerH - yScale(medY) : yScale(medY),
    };
    return {
      xScale,
      yScale,
      frontier: paretoFrontier(points, metric.direction),
      quadrant,
      labels: placeLabels(points, xScale, yScale, innerW, innerH),
      xTicks: niceLogTicks(xDomain),
      yTicks: yScale.ticks(5),
    };
  }, [points, metric.direction, innerW, innerH]);

  const frontierPath = frontier
    .map((p, i) => {
      const x = xScale(p.x);
      const y = yScale(p.y);
      if (i === 0) return `M${x},${y}`;
      return `H${x}V${y}`;
    })
    .join("");

  const open = (p) => navigate(`/models/${encodeURIComponent(p.id)}`);
  const show = (p) =>
    showTooltip({ tooltipData: p, tooltipLeft: xScale(p.x) + MARGIN.left, tooltipTop: yScale(p.y) + MARGIN.top });

  return (
    <div className="relative">
      <svg width={width} height={height} role="group" aria-label={`${metric.display_name} against ${xAxis.label}. ${frontier.length} models on the frontier.`}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          <rect x={quadrant.x} y={quadrant.y} width={Math.max(0, quadrant.w)} height={Math.max(0, quadrant.h)} fill="var(--accent-tint)" opacity="0.7" />
          <text x={8} y={metric.direction === "lower" ? innerH - 10 : 16} fontSize="12" fontWeight="500" fill="var(--accent-on-tint)" stroke="var(--accent-tint)" strokeWidth="4" strokeLinejoin="round" paintOrder="stroke">
            {innerW < 480 ? "Most attractive" : `Most attractive: ${xAxis.smaller} and more accurate than the median`}
          </text>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)} stroke="var(--grid)" />
              <text x={-10} y={yScale(t)} dy="0.32em" textAnchor="end" fontSize="12" fill="var(--ink-3)" className="num">
                {formatNumber(t, metric.unit)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <g key={t}>
              <line x1={xScale(t)} x2={xScale(t)} y1={0} y2={innerH} stroke="var(--grid)" />
              <text x={xScale(t)} y={innerH + 18} textAnchor="middle" fontSize="12" fill="var(--ink-3)" className="num">
                {xAxis.tick(t)}
              </text>
            </g>
          ))}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="var(--line-strong)" />
          <line x1={0} x2={0} y1={0} y2={innerH} stroke="var(--line-strong)" />
          <text x={innerW / 2} y={innerH + 38} textAnchor="middle" fontSize="12" fill="var(--ink-2)">{xAxis.label}</text>
          <path d={frontierPath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
          {points.map((p) => {
            const cx = xScale(p.x);
            const cy = yScale(p.y);
            const label = labels[p.id];
            return (
              <g
                key={p.id}
                tabIndex={0}
                role="link"
                aria-label={`${p.name}: ${metric.display_name} ${formatNumber(p.y, metric.unit)}, ${xAxis.describe(p)}`}
                onMouseEnter={() => show(p)}
                onMouseLeave={hideTooltip}
                onFocus={() => show(p)}
                onBlur={hideTooltip}
                onClick={() => open(p)}
                onKeyDown={(e) => e.key === "Enter" && open(p)}
                className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[var(--accent)]"
              >
                <circle cx={cx} cy={cy} r={14} fill="transparent" stroke="transparent" strokeWidth="2" />
                <circle cx={cx} cy={cy} r={6} fill={familyColor(p.family)} stroke="var(--page)" strokeWidth="2" />
                {label && (
                  <text
                    x={label.anchor === "end" ? cx - 10 : label.anchor.startsWith("middle") ? cx : cx + 10}
                    y={label.y + LABEL_H / 2}
                    dy="0.35em"
                    textAnchor={label.anchor === "end" ? "end" : label.anchor.startsWith("middle") ? "middle" : "start"}
                    fontSize="12"
                    fontWeight="500"
                    fill="var(--ink)"
                    stroke="var(--page)"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    paintOrder="stroke"
                  >
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          unstyled
          applyPositionStyle
          className="pointer-events-none z-tooltip min-w-[200px] rounded-lg bg-tooltip px-3 py-2.5 text-xs leading-relaxed text-tooltip-ink shadow-pop"
        >
          <div className="mb-1 text-[13px] font-semibold">{tooltipData.name}</div>
          {tooltipData.rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-tooltip-ink-2">{k}</span>
              <span className="num">{v}</span>
            </div>
          ))}
        </TooltipWithBounds>
      )}
    </div>
  );
}

/**
 * points: [{ id, name, family, x, y, rows: [[label, value]] }]
 * xAxis: { label, smaller, tick(v), describe(point) }
 */
export default function EfficiencyScatter(props) {
  const { parentRef, width } = useParentSize({ debounceTime: 50 });
  return <div ref={parentRef}>{width > 0 && <Chart width={width} {...props} />}</div>;
}
