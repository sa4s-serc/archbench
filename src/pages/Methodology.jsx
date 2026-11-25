import { Link } from "react-router-dom";
import { Calculator, ListChecks, Repeat, Upload } from "lucide-react";
import { taskInfo } from "../data/taskInfo";
import { useResults } from "../lib/ResultsContext";
import { DIRECTION_LABEL, humanize } from "../lib/metrics";
import { distinct, rowsFor } from "../lib/results";
import { inhouseRows, inhouseTasks } from "../lib/views";
import { Container, ExternalIcon, PageBand, SectionTitle } from "../components/ui";

function Card({ icon: Icon, title, children }) {
  return (
    <div className="card-flat p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Icon size={18} className="text-primary" aria-hidden="true" /> {title}
      </h2>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-base-content/75">{children}</div>
    </div>
  );
}

export default function Methodology() {
  const doc = useResults();
  const rows = inhouseRows(doc);
  const core = inhouseTasks(doc);
  const temps = distinct(rows, (r) => r.setup?.temperature).filter((v) => v != null);
  const allTasks = Object.keys(doc.tasks);

  return (
    <>
      <PageBand
        back={{ to: "/", label: "Home" }}
        title="Methodology"
        lead="How ArchBench evaluates models: the tasks and their datasets, the evaluation protocol, and how results are scored and ranked."
      />
      <Container className="mt-8 flex flex-col gap-10 pb-16">
        <section className="flex flex-col gap-4">
          <SectionTitle title="Tasks and metrics" lead="Each task comes with a public dataset and is ranked by one main metric. Other metrics are reported alongside it." />
          <div className="overflow-x-auto rounded-2xl border border-base-300/50">
            <table className="table table-sm min-w-[820px]">
              <thead>
                <tr className="border-base-300/50 bg-base-200/50 text-[11.5px] text-base-content/60">
                  <th>Task</th>
                  <th>Dataset</th>
                  <th>Ranked by</th>
                  <th>Also reported</th>
                </tr>
              </thead>
              <tbody>
                {allTasks.map((t) => {
                  const key = doc.tasks[t].primary_metric;
                  const metric = doc.metrics[t][key];
                  const info = taskInfo(t);
                  const described = info.facts.find(([k]) => k === "Dataset")?.[1];
                  const others = Object.entries(doc.metrics[t]).filter(([k, m]) => k !== key && m.direction !== "none").map(([, m]) => m.display_name);
                  return (
                    <tr key={t} className="border-base-300/50 align-top">
                      <th className="font-semibold"><Link to={`/leaderboard/${t}`} className="hover:text-primary">{doc.tasks[t].name}</Link></th>
                      <td className="max-w-[260px] text-base-content/70">
                        {described ?? (info.datasetLink ? "Public dataset" : "–")}
                        {info.datasetLink && (
                          <a href={info.datasetLink} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center text-primary hover:underline" aria-label={`${doc.tasks[t].name} dataset`}>
                            <ExternalIcon size={12} />
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap">{metric.display_name} <span className="text-base-content/50">({DIRECTION_LABEL[metric.direction].toLowerCase()})</span></td>
                      <td className="text-base-content/70">{others.join(", ") || "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card icon={ListChecks} title="Evaluation protocol">
            <p>
              Within a task, every entry is scored with the same metrics against the same reference data. Each result links to its
              source, which records the prompts and settings behind it.
            </p>
            <p>
              Results produced with the ArchBench CLI follow one protocol: every model receives the same prompts, first with the task
              description alone and, where the task defines them, with a small set of worked examples in the prompt.
            </p>
            <p>
              Sampling temperature is fixed at {temps.join(", ")}. Models with a reasoning mode are evaluated with it disabled where the
              model allows it, so every model is scored on its direct answer. Each task sets a maximum output length.
            </p>
          </Card>
          <Card icon={Repeat} title="Repeated runs">
            <p>
              Model outputs vary from run to run, so each task is evaluated several times and the reported result is the mean. The spread
              between runs is shown as ± next to each result.
            </p>
            <table className="table table-xs mt-1">
              <thead><tr className="text-base-content/60"><th>Task</th><th>Prompts</th><th className="text-right">Runs</th></tr></thead>
              <tbody>
                {core.map((t) => {
                  const tr = rowsFor(doc, t, { source: "inhouse" });
                  return (
                    <tr key={t}>
                      <td>{taskInfo(t).shortName}</td>
                      <td>{distinct(tr, (r) => r.setup?.prompt_style).filter(Boolean).sort((a) => (a === "zero_shot" ? -1 : 1)).map(humanize).join(", ")}</td>
                      <td className="num text-right">{Math.max(...tr.map((r) => r.setup?.seeds?.length ?? 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <Card icon={Calculator} title="Scoring and ranking">
            <p>On each task, entries are ranked by the task&apos;s main metric in its own direction. Entries with equal results share a rank.</p>
            <p>
              Across tasks, models are compared by their <strong className="text-base-content">average rank</strong>: the mean of their place on
              each of the {core.length} core tasks ({core.map((t) => taskInfo(t).shortName).join(", ")}). Places are counted among the models
              evaluated with the ArchBench CLI, so every model in the comparison had the same prompts and settings. A model needs a
              result on every core task to receive an average rank.
            </p>
          </Card>
          <Card icon={Upload} title="Submitting results">
            <p>
              Results are produced with the{" "}
              <a href="https://github.com/sa4s-serc/archbench-cli" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">ArchBench CLI <ExternalIcon size={12} /></a>,
              which runs the prompts and metrics above. Every result links to its source.
            </p>
            <Link to="/contribute" className="text-primary hover:underline">How to submit results</Link>
          </Card>
        </div>
      </Container>
    </>
  );
}
