import { Link } from "react-router-dom";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { rowsFor } from "../lib/results";
import { primaryMetric } from "../lib/views";
import { ChevronRight, DirectionArrow, Page, PageHeader, Tag } from "../components/ui";

const Tasks = () => {
  const doc = useResults();

  return (
    <Page>
      <PageHeader
        title="Tasks"
        lead="Six software-architecture tasks. Four are part of the in-house sweep; two are covered by published results only. Each page explains the inputs, the metrics and which way each metric is better."
      />
      <ul className="mt-12 flex flex-col">
        {Object.keys(doc.tasks).map((id) => {
          const task = doc.tasks[id];
          const info = taskInfo(id);
          const metric = primaryMetric(doc, id);
          const inhouse = new Set(rowsFor(doc, id, { source: "inhouse" }).map((r) => r.model_id)).size;
          const paper = new Set(
            rowsFor(doc, id, { source: "paper" }).map((r) => [r.model_id, r.setup?.prompt_style, r.setup?.approach].join("|")),
          ).size;
          return (
            <li key={id}>
              <Link
                to={`/tasks/${id}`}
                className="grid grid-cols-[minmax(0,1fr)_16px] items-center gap-4 border-t border-line px-1 py-5 transition-colors duration-150 hover:bg-surface"
              >
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-[17px] font-medium">{task.name}</span>
                    {!task.inhouse && <Tag>Paper only</Tag>}
                  </span>
                  <span className="max-w-2xl text-sm leading-relaxed text-ink-2">{info.summary}</span>
                  <span className="num flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-3">
                    <span>
                      Ranked by {metric.display_name}
                      <DirectionArrow direction={metric.direction} />
                    </span>
                    {task.inhouse && <span>{inhouse ? `${inhouse} in-house models` : "In-house sweep in progress"}</span>}
                    <span>{paper} paper result{paper === 1 ? "" : "s"}</span>
                  </span>
                </span>
                <span className="text-ink-3"><ChevronRight /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Page>
  );
};

export default Tasks;
