import { useMemo } from "react";
import { Link } from "react-router-dom";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { buildMatrix, defaultPrompt, formatParams, inhouseRows, promptStyles } from "../lib/views";
import { ChevronRight, FamilyDot, Page, PageHeader, SectionHeader } from "../components/ui";

function InhouseModels({ doc }) {
  const prompt = defaultPrompt(promptStyles(inhouseRows(doc)));
  const matrix = useMemo(() => buildMatrix(doc, prompt, (id) => taskInfo(id).shortName), [doc, prompt]);
  const avgRank = Object.fromEntries(matrix.models.map((m) => [m.id, m.avgRank]));
  const ids = [...new Set(inhouseRows(doc).map((r) => r.model_id))];
  const tiers = doc.tiers.filter((t) => ids.some((id) => doc.models[id]?.tier === t.id));

  return (
    <section className="mt-12 flex flex-col gap-6" aria-labelledby="inhouse-models">
      <SectionHeader
        title={<span id="inhouse-models">In-house sweep</span>}
        lead={`${ids.length} open-weight models run through the same harness on every in-house task, grouped by size. Average rank is across tasks.`}
      />
      {tiers.map((tier) => {
        const models = ids
          .filter((id) => doc.models[id]?.tier === tier.id)
          .sort((a, b) => (avgRank[a] ?? Infinity) - (avgRank[b] ?? Infinity));
        return (
          <div key={tier.id} className="flex flex-col">
            <h3 className="pb-2 text-sm font-semibold">
              {tier.label} <span className="font-normal text-ink-3">parameters</span>
            </h3>
            <ul>
              {models.map((id) => {
                const model = doc.models[id];
                return (
                  <li key={id}>
                    <Link
                      to={`/models/${encodeURIComponent(id)}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-4 border-t border-line px-1 py-3 transition-colors duration-150 hover:bg-surface sm:grid-cols-[minmax(0,1fr)_120px_120px_16px]"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <FamilyDot family={model.family} />
                        <span className="truncate font-medium">{model.display_name}</span>
                        <span className="hidden text-[13px] text-ink-2 sm:inline">{model.org}</span>
                      </span>
                      <span className="num hidden text-right text-[13px] text-ink-2 sm:block">{formatParams(model)}</span>
                      <span className="num text-right text-[13px] text-ink-2">
                        {Number.isFinite(avgRank[id]) ? `Avg rank ${avgRank[id].toFixed(2)}` : "–"}
                      </span>
                      <span className="text-ink-3"><ChevronRight /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function PaperModels({ doc }) {
  const byModel = new Map();
  for (const r of doc.results) {
    if (r.source !== "paper") continue;
    if (!byModel.has(r.model_id)) byModel.set(r.model_id, new Set());
    byModel.get(r.model_id).add(r.task);
  }
  const ids = [...byModel.keys()].sort((a, b) =>
    (doc.models[a]?.display_name ?? a).localeCompare(doc.models[b]?.display_name ?? b),
  );

  return (
    <section className="mt-16 flex flex-col gap-5" aria-labelledby="paper-models">
      <SectionHeader
        title={<span id="paper-models">In published results</span>}
        lead="Models and tools that appear in the papers behind each task. Their numbers come from different setups, so they are listed, not ranked."
      />
      <ul>
        {ids.map((id) => {
          const model = doc.models[id];
          const tasks = [...byModel.get(id)].map((t) => taskInfo(t).shortName);
          return (
            <li key={id}>
              <Link
                to={`/models/${encodeURIComponent(id)}`}
                className="grid grid-cols-[minmax(0,1fr)_16px] items-center gap-4 border-t border-line px-1 py-3 transition-colors duration-150 hover:bg-surface sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_16px]"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{model?.display_name ?? id}</span>
                  <span className="truncate text-[13px] text-ink-2">{[model?.family, model?.org].filter(Boolean).join(", ")}</span>
                </span>
                <span className="hidden text-[13px] text-ink-2 sm:block">{tasks.join(", ")}</span>
                <span className="text-ink-3"><ChevronRight /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Models() {
  const doc = useResults();
  const hasInhouse = inhouseRows(doc).length > 0;
  return (
    <Page>
      <PageHeader
        title="Models"
        lead="Every model on ArchBench. Open one to see how it does on each task, how fast it runs and how it was evaluated."
      />
      {hasInhouse ? (
        <InhouseModels doc={doc} />
      ) : (
        <p className="mt-12 max-w-2xl rounded-2xl border border-line bg-surface p-6 text-[15px] leading-relaxed text-ink-2">
          The in-house sweep of small open-weight models is in progress. Its models will be listed here by size tier.
        </p>
      )}
      <PaperModels doc={doc} />
    </Page>
  );
}
