import { useState } from "react";
import papersData from "../data/papersData.json";
import { Button, Dialog, ExternalIcon, Page, PageHeader } from "../components/ui";

const papers = [...papersData.papers].sort((a, b) => parseInt(b.year) - parseInt(a.year));

function CiteDialog({ paper, onClose }) {
  const [copied, setCopied] = useState(false);
  const citation = paper?.citation || "Citation not available";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog
      open={Boolean(paper)}
      onClose={onClose}
      title="Cite this paper"
      actions={
        <Button onClick={copy} className="min-h-[36px] px-3 text-[13px]">
          {copied ? "Copied" : "Copy BibTeX"}
        </Button>
      }
    >
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink">
        {citation}
      </pre>
    </Dialog>
  );
}

const Papers = () => {
  const [query, setQuery] = useState("");
  const [citing, setCiting] = useState(null);
  const q = query.trim().toLowerCase();
  const shown = papers.filter(
    (p) => !q || p.title.toLowerCase().includes(q) || p.authors.join(" ").toLowerCase().includes(q),
  );

  return (
    <Page>
      <PageHeader title="Papers" lead="The research behind ArchBench's tasks and datasets, newest first." />
      <div className="mt-10 max-w-md">
        <label htmlFor="paper-search" className="mb-1.5 block text-[13px] text-ink-2">Search by title or author</label>
        <input
          id="paper-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-line-strong bg-page px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
        />
      </div>
      <ul className="mt-8 flex flex-col">
        {shown.map((paper) => (
          <li key={paper.id} className="flex flex-col gap-2.5 border-t border-line py-7">
            <p className="num text-[13px] text-ink-3">{paper.year}</p>
            <h2 className="max-w-3xl text-lg font-semibold leading-snug">
              {paper.arxivLink ? (
                <a href={paper.arxivLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{paper.title}</a>
              ) : (
                paper.title
              )}
            </h2>
            <p className="max-w-3xl text-sm text-ink-2">{paper.authors.join(", ")}</p>
            {paper.abstract && (
              <details className="group max-w-3xl">
                <summary className="link w-fit cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Show abstract</span>
                  <span className="hidden group-open:inline">Hide abstract</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{paper.abstract}</p>
              </details>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm">
              {paper.arxivLink && (
                <a href={paper.arxivLink} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                  {paper.paperLinkLabel || "arXiv"} <ExternalIcon size={12} />
                </a>
              )}
              {paper.githubLink && (
                <a href={paper.githubLink} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                  {paper.repoLinkLabel || "GitHub"} <ExternalIcon size={12} />
                </a>
              )}
              {paper.citation && (
                <button type="button" onClick={() => setCiting(paper)} className="link">Cite</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="py-12 text-sm text-ink-2">
          No papers match &ldquo;{query}&rdquo;.{" "}
          <button type="button" onClick={() => setQuery("")} className="link">Clear the search</button>
        </p>
      )}
      <CiteDialog paper={citing} onClose={() => setCiting(null)} />
    </Page>
  );
};

export default Papers;
