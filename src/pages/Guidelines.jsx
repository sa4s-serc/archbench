import { Link } from "react-router-dom";
import { Page, PageHeader } from "../components/ui";

// Placeholder: the guidance is written once the in-house sweep has results.
const Guidelines = () => (
  <Page>
    <PageHeader
      title="Practitioner guidelines"
      lead="Plain-language advice on choosing a small open-weight model for architecture work: which size is good enough for which task, and what it costs to run."
    />
    <section className="mt-12 flex max-w-2xl flex-col gap-3 border-t border-line pt-8">
      <h2 className="text-lg font-semibold">Coming with the in-house results</h2>
      <p className="text-[15px] leading-relaxed text-ink-2">
        These guidelines are drawn from the in-house sweep, which runs the same models through one harness on every task.
        Until it is published, the <Link to="/" className="link">overview</Link> and the{" "}
        <Link to="/tasks" className="link">task pages</Link> show the results reported in papers.
      </p>
    </section>
  </Page>
);

export default Guidelines;
