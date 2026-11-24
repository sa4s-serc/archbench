import { Link } from "react-router-dom";
import { ModelLogo } from "../ui";

// Only the podium is marked; everything else is plain text so the table stays
// quiet and the marks carry the meaning.
function Place({ rank, count, label }) {
  const title = `${label}: #${rank} of ${count}`;
  if (rank === 1)
    return <span title={title} className="num mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">1</span>;
  if (rank <= 3)
    return <span title={title} className="num mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/30">{rank}</span>;
  return <span title={title} className={`num text-[13px] ${rank <= 10 ? "text-base-content/85" : "text-base-content/40"}`}>{rank}</span>;
}

/**
 * Models as rows, tasks as columns, each cell the model's place on that task.
 * models: [{ id, name, model, avgRank, cells: { [taskId]: { rank, count } } }]
 * tasks: [{ id, name }]
 */
export default function RankHeatmap({ models, tasks }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-base-300/60 text-[11.5px] text-base-content/55">
              <th className="py-2 text-left font-medium">Model</th>
              {tasks.map((t) => (
                <th key={t.id} className="px-1 py-2 text-center font-medium">
                  <Link to={`/leaderboard/${t.id}`} className="hover:text-primary">{t.name}</Link>
                </th>
              ))}
              <th className="py-2 pl-2 text-right font-medium">Avg. rank</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={m.id} className="row-in border-b border-base-300/30 last:border-0 hover:bg-base-300/20" style={{ animationDelay: `${i * 25}ms` }}>
                <th className="py-1.5 pr-2 text-left font-normal">
                  <Link to={`/models/${encodeURIComponent(m.id)}`} className="flex items-center gap-2 whitespace-nowrap font-medium hover:text-primary">
                    <ModelLogo model={m.model} size={14} />
                    {m.name}
                  </Link>
                </th>
                {tasks.map((t) => {
                  const c = m.cells[t.id];
                  return (
                    <td key={t.id} className="h-10 px-1 text-center">
                      {c?.rank != null ? <Place rank={c.rank} count={c.count} label={`${m.name} on ${t.name}`} /> : <span className="text-base-content/30">–</span>}
                    </td>
                  );
                })}
                <td className="num py-1.5 pl-2 text-right font-semibold">{m.avgRank.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-base-content/55">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> 1st</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary/15 ring-1 ring-primary/30" /> 2nd or 3rd</span>
        <span>Grey: outside the top 10</span>
      </div>
    </div>
  );
}
