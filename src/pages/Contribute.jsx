import { Page, PageHeader } from "../components/ui";

const CLI = "https://github.com/sa4s-serc/archbench-cli";
const SITE = "https://github.com/sa4s-serc/archbench";

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

const Contribute = () => (
  <Page>
    <PageHeader
      title="Contribute to ArchBench"
      lead="ArchBench is a benchmark for evaluating large language models on software architecture tasks. Contributions of results, data, code and documentation are all welcome."
    />
    <div className="mt-12 flex max-w-2xl flex-col gap-10">
      <Section title="Ways to contribute">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-ink-3">
          <li><strong className="font-medium text-ink">Submit results:</strong> run evaluations on new models and submit them to the leaderboard.</li>
          <li><strong className="font-medium text-ink">Improve datasets:</strong> help curate and expand the benchmark datasets.</li>
          <li><strong className="font-medium text-ink">Code:</strong> improve the evaluation framework, add tasks or improve this website.</li>
          <li><strong className="font-medium text-ink">Report issues:</strong> found a bug or have a suggestion? Open an issue on GitHub.</li>
          <li><strong className="font-medium text-ink">Documentation:</strong> help improve the documentation and tutorials.</li>
        </ul>
      </Section>
      <Section title="Submitting results">
        <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-ink-3">
          <li>Use the <a href={CLI} className="link">ArchBench CLI</a> to run the evaluations on your model.</li>
          <li>Follow the submission guidelines in the CLI repository.</li>
          <li>Open a pull request to the <a href={SITE} className="link">archbench-results</a> repository with your predictions and trajectories.</li>
        </ol>
      </Section>
      <Section title="Contributing code">
        <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-ink-3">
          <li>
            Fork the relevant repository: the <a href={CLI} className="link">ArchBench CLI</a> for the evaluation framework,
            or the <a href={SITE} className="link">ArchBench website</a> for this site and leaderboard.
          </li>
          <li>Create a feature branch for your changes.</li>
          <li>Make your changes and make sure the tests pass.</li>
          <li>Open a pull request with a clear description of the change.</li>
        </ol>
      </Section>
    </div>
  </Page>
);

export default Contribute;
