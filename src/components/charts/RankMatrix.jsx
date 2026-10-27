import { Link } from "react-router-dom";
import { rankFill, rankRamp } from "../../lib/colors";
import { formatNumber } from "../../lib/metrics";
import { useTheme } from "../../lib/theme";
import { DirectionArrow, FamilyDot } from "../ui";

/**
 * Model × task matrix for the in-house sweep. Each cell is the model's rank on
 * that task (shaded: stronger is better) and its primary score.
 * matrix: { tasks: [{ id, name, metric }], models: [{ id, name, family, params, tierLabel, avgRank, cells: { [taskId]: { rank, value, count } } }] }
 */
export default function RankMatrix({ matrix, show }) {
  const { theme } = useTheme();
  const { tasks, models } = matrix;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm" aria-label="In-house rank by task">
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: 64 }} />
            {tasks.map((t) => <col key={t.id} />)}
            <col style={{ width: 80 }} />
          </colgroup>
          <thead>
            <tr className="text-left text-xs text-ink-3">
              <th scope="col" className="sticky left-0 bg-page pb-2 pr-2 font-normal">Model</th>
              <th scope="col" className="pb-2 font-normal">Size</th>
              {tasks.map((t) => (
                <th key={t.id} scope="col" className="px-2.5 pb-2 align-bottom font-normal">
                  <Link to={`/tasks/${t.id}`} className="block text-[13px] font-medium text-ink hover:text-accent">{t.name}</Link>
                  <span className="whitespace-nowrap">
                    {t.metric.display_name}
                    <DirectionArrow direction={t.metric.direction} />
                  </span>
                </th>
              ))}
              <th scope="col" className="pb-2 pr-1 text-right font-normal">Avg rank</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id}>
                <th scope="row" className="sticky left-0 z-[1] bg-page py-[1px] pr-2 text-left font-normal">
                  <Link to={`/models/${encodeURIComponent(m.id)}`} className="flex items-center gap-2.5 py-2 hover:text-accent">
                    <FamilyDot family={m.family} />
                    <span className="whitespace-nowrap font-medium">{m.name}</span>
                  </Link>
                </th>
                <td className="num whitespace-nowrap text-xs text-ink-2">{m.params}</td>
                {tasks.map((t) => {
                  const cell = m.cells[t.id];
                  if (!cell || cell.rank === null) {
                    return (
                      <td key={t.id} className="p-[1px]">
                        <span className="flex h-11 items-center justify-center rounded bg-surface text-xs text-ink-3">–</span>
                      </td>
                    );
                  }
                  const fill = rankFill(cell.rank, cell.count, theme);
                  const score = formatNumber(cell.value, t.metric.unit);
                  return (
                    <td key={t.id} className="p-[1px]">
                      <span
                        className="num flex h-11 items-baseline justify-between gap-2 rounded px-3 pt-3"
                        style={{ background: fill.bg, color: fill.fg }}
                        title={`${m.name}, ${t.name}: rank ${cell.rank} of ${cell.count}, ${t.metric.display_name} ${score}`}
                      >
                        {show === "score" ? (
                          <>
                            <span className="text-[15px] font-semibold">{score}</span>
                            <span className="text-xs opacity-90">#{cell.rank}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-base font-semibold">{cell.rank}</span>
                            <span className="text-xs opacity-90">{score}</span>
                          </>
                        )}
                      </span>
                    </td>
                  );
                })}
                <td className="num pr-1 text-right">{m.avgRank.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Legend theme={theme} count={Math.max(...models.map((m) => Math.max(0, ...Object.values(m.cells).map((c) => c.count))))} families={[...new Set(models.map((m) => m.family))]} />
    </div>
  );
}

function Legend({ theme, count, families }) {
  const ramp = rankRamp(theme, Math.min(Math.max(count, 2), 12));
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-ink-2">
      <div className="flex items-center gap-2">
        <span>Rank 1</span>
        <span className="flex gap-0.5" aria-hidden="true">
          {ramp.map((c) => <span key={c} className="h-2.5 w-3.5 rounded-sm" style={{ background: c }} />)}
        </span>
        <span className="num">{count}</span>
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5">
        {families.map((f) => (
          <span key={f} className="flex items-center gap-1.5"><FamilyDot family={f} />{f}</span>
        ))}
      </div>
    </div>
  );
}
