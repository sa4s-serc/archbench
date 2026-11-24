import { useResults } from "../lib/ResultsContext";
import ModelTable from "../components/ModelTable";
import { Container, PageBand } from "../components/ui";

export default function Models() {
  const doc = useResults();
  return (
    <>
      <PageBand
        back={{ to: "/", label: "Home" }}
        title="Models"
        lead="Every model on the benchmark, with its average rank, its size and its result on each task. Open a model for its full results."
      />
      <Container className="mt-8 pb-16">
        <ModelTable doc={doc} />
      </Container>
    </>
  );
}
