import { useState } from "react";
import { Check, Copy, ExternalLink, Github, Quote, Search } from "lucide-react";
import papersData from "../data/papersData.json";
import ExpandableText from "../components/ExpandableText";
import { Container, Dialog, PageBand } from "../components/ui";

export default function Papers() {
  const [query, setQuery] = useState("");
  const [citing, setCiting] = useState(null);
  const [copied, setCopied] = useState(false);
  const q = query.trim().toLowerCase();
  const papers = [...papersData.papers]
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.authors.join(" ").toLowerCase().includes(q));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citing?.citation ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <PageBand
        back={{ to: "/", label: "Home" }}
        title="Papers"
        lead="The research behind ArchBench's tasks and datasets, newest first."
      >
        <label className="mt-6 flex max-w-md items-center gap-2 rounded border border-base-300 bg-base-100 px-3">
          <Search size={15} className="text-base-content/50" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or author" aria-label="Search papers" className="h-10 w-full bg-transparent text-[14px] outline-none" />
        </label>
      </PageBand>
      <Container className="mt-8 max-w-[960px]">
        <ul className="flex flex-col divide-y divide-base-300 border-y border-base-300">
          {papers.map((p) => (
            <li key={p.id} className="py-6">
              <p className="num text-[12.5px] text-base-content/55">{p.year}</p>
              <h2 className="font-bold mt-1 text-[22px] leading-snug">
                {p.arxivLink ? <a href={p.arxivLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.title}</a> : p.title}
              </h2>
              <p className="mt-1.5 text-[13.5px] text-base-content/60">{p.authors.join(", ")}</p>
              {p.abstract && (
                <ExpandableText className="mt-3 text-[14px] leading-relaxed text-base-content/75" lines={3} minLength={180}>
                  {p.abstract}
                </ExpandableText>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-[13.5px]">
                {p.arxivLink && <a href={p.arxivLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline"><ExternalLink size={14} aria-hidden="true" />{p.paperLinkLabel || "arXiv"}</a>}
                {p.githubLink && <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline"><Github size={14} aria-hidden="true" />{p.repoLinkLabel || "GitHub"}</a>}
                {p.citation && <button type="button" onClick={() => setCiting(p)} className="inline-flex items-center gap-1.5 hover:underline"><Quote size={14} aria-hidden="true" />Cite</button>}
              </div>
            </li>
          ))}
        </ul>
        {papers.length === 0 && <p className="py-12 text-center text-[14px] text-base-content/60">No papers match your search.</p>}
      </Container>
      <Dialog
        open={Boolean(citing)}
        onClose={() => setCiting(null)}
        title="Citation"
        actions={
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded border border-base-300 px-3 py-1.5 text-[13px] hover:bg-base-200">
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? "Copied" : "Copy BibTeX"}
          </button>
        }
      >
        <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-base-200 p-4 font-mono text-[13px]">{citing?.citation}</pre>
      </Dialog>
    </>
  );
}
