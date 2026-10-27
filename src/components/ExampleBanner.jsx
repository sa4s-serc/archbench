import { useResults } from "../lib/ResultsContext";

// Shown whenever the loaded results are the contract's fake fixture.
export default function ExampleBanner() {
  const doc = useResults();
  if (!doc.example) return null;
  return (
    <div className="border-b border-line bg-surface">
      <p className="mx-auto flex max-w-content flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-[13px] text-ink-2 sm:px-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
        <span>
          <strong className="font-semibold text-ink">Example data.</strong> In-house numbers are a fixture from the results
          contract, not real benchmark results.
        </span>
        {import.meta.env.DEV && (
          <a href="?data=real" className="link">Show real data</a>
        )}
      </p>
    </div>
  );
}
