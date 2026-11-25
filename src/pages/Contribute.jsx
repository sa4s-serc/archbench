import { Bug, Code2, Database, FileText, Upload } from "lucide-react";
import { Container, PageBand, SectionTitle } from "../components/ui";

const CLI = "https://github.com/sa4s-serc/archbench-cli";
const SITE = "https://github.com/sa4s-serc/archbench";

const WAYS = [
  [Upload, "Submit results", "Run evaluations on new models and submit your results to the leaderboard."],
  [Database, "Improve datasets", "Help curate and expand the benchmark datasets."],
  [Code2, "Code contributions", "Enhance the evaluation framework, add new tasks, or improve the website."],
  [Bug, "Report issues", "Found a bug or have suggestions? Open an issue on GitHub."],
  [FileText, "Documentation", "Help improve documentation and tutorials."],
];

export default function Contribute() {
  return (
    <>
      <PageBand
        back={{ to: "/", label: "Home" }}
        title="Contributing to ArchBench"
        lead="ArchBench is a benchmark for evaluating large language models on software-architecture tasks. We welcome contributions in various forms to help improve and expand the benchmark."
      />
      <Container className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionTitle title="Ways to contribute" />
          <ul className="card-flat mt-4 divide-y divide-base-300">
            {WAYS.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3 p-4">
                <Icon size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-[14.5px]"><strong className="font-semibold">{title}.</strong> <span className="text-base-content/75">{text}</span></p>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col gap-10">
          <section>
            <SectionTitle title="Submitting results" lead="To submit your model's results to the ArchBench leaderboard:" />
            <ol className="card-flat mt-4 list-decimal space-y-2 p-5 pl-10 text-[14.5px]">
              <li>Use the <a href={CLI} className="link link-primary">ArchBench CLI</a> to run evaluations on your model.</li>
              <li>Follow the submission guidelines in the CLI repository.</li>
              <li>Create a pull request to the <a href={SITE} className="link link-primary">archbench-results</a> repository with your predictions and trajectories.</li>
            </ol>
          </section>
          <section>
            <SectionTitle title="Contributing code" lead="If you'd like to contribute code:" />
            <ol className="card-flat mt-4 list-decimal space-y-2 p-5 pl-10 text-[14.5px]">
              <li>
                Fork the relevant repository: the <a href={CLI} className="link link-primary">ArchBench CLI</a> for the evaluation framework and CLI tool, or
                the <a href={SITE} className="link link-primary">ArchBench website</a> for this website and leaderboard interface.
              </li>
              <li>Create a feature branch for your changes.</li>
              <li>Make your changes and ensure tests pass.</li>
              <li>Submit a pull request with a clear description of your changes.</li>
            </ol>
          </section>
        </div>
      </Container>
    </>
  );
}
