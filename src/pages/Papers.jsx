import React, { useState } from "react";
import papersData from "../data/papersData.json";
import TopBar from "../components/TopBar";
import { ExternalLink, Github, Quote } from "lucide-react";

const Papers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentCitation, setCurrentCitation] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const openCitationModal = (paperId) => {
    const paper = papersData.papers.find(p => p.id === paperId);
    const citation = paper?.citation || "Citation not available";
    setCurrentCitation(citation);
    setShowModal(true);
    setTimeout(() => {
      document.getElementById("citation_modal").showModal();
    }, 100);
  };

  const closeModal = (e) => {
    const modal = document.getElementById("citation_modal");
    if (e.target === modal) {
      modal.close();
      setShowModal(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentCitation);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const sortedPapers = [...papersData.papers]
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <>
      <TopBar
        title="Papers"
        subtitle="Research papers behind the benchmark"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search papers..."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {sortedPapers.map((paper) => (
            <div
              key={paper.id}
              className="group relative rounded-2xl bg-base-200/40 border border-base-300/50 hover:border-primary/20 p-6 transition-all duration-300"
            >
              {/* Year badge */}
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                {paper.year}
              </div>

              <h3 className="text-lg font-bold mb-2 leading-snug">
                <a
                  href={paper.arxivLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {paper.title}
                </a>
              </h3>

              <p className="text-sm text-base-content/50 mb-3">
                {paper.authors.join(", ")}
              </p>

              <p className="text-sm text-base-content/70 leading-relaxed mb-4">
                {paper.abstract}
              </p>

              <div className="flex flex-wrap gap-2">
                {paper.arxivLink && (
                  <a
                    href={paper.arxivLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost rounded-xl gap-1.5 text-xs"
                  >
                    <ExternalLink size={13} />
                    {paper.paperLinkLabel || "arXiv"}
                  </a>
                )}
                {paper.githubLink && (
                  <a
                    href={paper.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost rounded-xl gap-1.5 text-xs"
                  >
                    <Github size={13} />
                    {paper.repoLinkLabel || "GitHub"}
                  </a>
                )}
                <button
                  onClick={() => openCitationModal(paper.id)}
                  className="btn btn-sm btn-ghost rounded-xl gap-1.5 text-xs"
                >
                  <Quote size={13} />
                  Cite
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedPapers.length === 0 && (
          <div className="text-center py-16 text-base-content/40">
            <p>No papers match your search.</p>
          </div>
        )}
      </div>

      <dialog id="citation_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-3xl rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Citation</h3>
            <button
              onClick={copyToClipboard}
              className="btn btn-sm btn-outline rounded-xl"
              disabled={copySuccess}
            >
              {copySuccess ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <div className="bg-base-200 p-4 rounded-xl overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {currentCitation}
            </pre>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn rounded-xl">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Papers;