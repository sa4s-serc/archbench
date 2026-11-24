import { useResults } from "../lib/ResultsContext";
import { Container } from "./ui";

// Shown whenever the loaded results are the contract's fake fixture.
export default function ExampleBanner() {
  const doc = useResults();
  if (!doc.example) return null;
  return (
    <div className="border-y border-warning/40 bg-warning/15">
      <Container className="py-2.5 text-[13px]">
        <strong className="font-semibold">Example data.</strong> In-house numbers are a fixture from the results contract, not real
        benchmark results.{import.meta.env.DEV && <a href="?data=real" className="link ml-2">Show real data</a>}
      </Container>
    </div>
  );
}
