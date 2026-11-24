import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatParams } from "../../lib/views";

const M = { top: 14, right: 16, bottom: 44, left: 46 };

// Models no smaller model beats: the best you can get at each size.
export function bestForSize(points) {
  const bySize = [...points].sort((a, b) => a.size - b.size || a.avgRank - b.avgRank);
  const out = [];
  let best = Infinity;
  for (const p of bySize) {
    if (p.avgRank < best) {
      out.push(p);
      best = p.avgRank;
    }
  }
  return out;
}

// Measure the box so the chart is drawn at true pixel size: text stays at its
// set size instead of shrinking with the viewBox.
function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/**
 * Model size (log scale) against average rank (best at the top). The line joins
 * the models that beat every smaller model.
 * points: [{ id, name, size, avgRank, model }]
 */
export default function SizeScatter({ points, minHeight = 320 }) {
  const navigate = useNavigate();
  const box = useRef(null);
  const { w, h: boxH } = useSize(box);
  const [hover, setHover] = useState(null);
  const W = w;
  const H = Math.max(minHeight, boxH);

  let body = null;
  let tip = null;
  if (W > 0 && points.length) {
    const minS = Math.min(...points.map((p) => p.size));
    const maxS = Math.max(...points.map((p) => p.size));
    const lx0 = Math.log2(Math.max(0.25, minS / 1.4));
    const lx1 = Math.log2(maxS * 1.4);
    const maxR = Math.ceil(Math.max(...points.map((p) => p.avgRank)) / 5) * 5;
    const x = (s) => M.left + ((Math.log2(s) - lx0) / (lx1 - lx0)) * (W - M.left - M.right);
    const y = (r) => M.top + ((r - 1) / (maxR - 1)) * (H - M.top - M.bottom);
    const xTicks = [0.5, 1, 2, 4, 8, 16, 32, 64].filter((t) => Math.log2(t) >= lx0 && Math.log2(t) <= lx1);
    const yTicks = [1, ...Array.from({ length: maxR / 5 }, (_, i) => (i + 1) * 5)];
    const frontier = bestForSize(points);
    const onFrontier = new Set(frontier.map((p) => p.id));
    const path = frontier.map((p, i) => `${i ? "L" : "M"}${x(p.size).toFixed(1)},${y(p.avgRank).toFixed(1)}`).join(" ");

    // Label the line's models, skipping any label that would overlap one
    // already placed. Labels on the right half sit to the left of their dot.
    const labels = [];
    for (const p of [...frontier].sort((a, b) => b.size - a.size)) {
      const px = x(p.size);
      const py = y(p.avgRank);
      const tw = p.name.length * 6.6;
      const left = px > W * 0.55;
      const b = { x0: left ? px - 10 - tw : px + 10, x1: left ? px - 10 : px + 10 + tw, y0: py - 20, y1: py - 4 };
      if (labels.some((l) => b.x0 < l.b.x1 && b.x1 > l.b.x0 && b.y0 < l.b.y1 && b.y1 > l.b.y0)) continue;
      labels.push({ p, b, left, px, py });
    }

    body = (
      <svg width={W} height={H} className="block" role="img" aria-label="Model size against average rank">
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="stroke-base-300/70" strokeWidth="1" />
            <text x={M.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-base-content/50 text-[12px]">{t}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} x={x(t)} y={H - M.bottom + 20} textAnchor="middle" className="fill-base-content/50 text-[12px]">{t}B</text>
        ))}
        <text x={M.left + (W - M.left - M.right) / 2} y={H - 6} textAnchor="middle" className="fill-base-content/55 text-[12px]">Parameters, log scale</text>
        <text transform={`translate(13 ${M.top + (H - M.top - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="fill-base-content/55 text-[12px]">Average rank (1 is best)</text>

        <path d={path} fill="none" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />

        {points
          .slice()
          .sort((a, b) => onFrontier.has(a.id) - onFrontier.has(b.id))
          .map((p) => {
            const on = hover?.id === p.id;
            const front = onFrontier.has(p.id);
            return (
              <g key={p.id} onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)} onClick={() => navigate(`/models/${encodeURIComponent(p.id)}`)} className="cursor-pointer">
                <circle cx={x(p.size)} cy={y(p.avgRank)} r="12" fill="transparent" />
                <circle
                  cx={x(p.size)}
                  cy={y(p.avgRank)}
                  r={on ? 7 : front ? 5.5 : 4.5}
                  className={`${front ? "fill-primary" : "fill-base-content/25"} stroke-base-200 transition-all`}
                  strokeWidth="2"
                />
              </g>
            );
          })}
        {labels.map(({ p, left, px, py }) => (
          <text key={`l${p.id}`} x={left ? px - 10 : px + 10} y={py - 9} textAnchor={left ? "end" : "start"} className="pointer-events-none fill-base-content/85 text-[12px] font-medium">
            {p.name}
          </text>
        ))}
        {hover && (
          <g className="pointer-events-none">
            <circle cx={x(hover.size)} cy={y(hover.avgRank)} r="7" fill="none" className="stroke-base-content" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    );
    if (hover) tip = { left: x(hover.size), top: y(hover.avgRank) };
  }

  return (
    <div ref={box} className="relative h-full w-full" style={{ minHeight }}>
      {body}
      {hover && tip && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-base-300/70 bg-base-100 px-3 py-2 text-xs shadow-md" style={{ left: tip.left, top: tip.top - 12 }}>
          <p className="whitespace-nowrap font-semibold">{hover.name}</p>
          <p className="whitespace-nowrap text-base-content/60">{formatParams(hover.model)} parameters, average rank {hover.avgRank.toFixed(1)}</p>
        </div>
      )}
    </div>
  );
}
