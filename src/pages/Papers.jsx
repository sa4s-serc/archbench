import React, { useState } from "react";
import papersData from "../data/papersData.json";

const Papers = () => {
  const sortedPapers = [...papersData.papers].sort(
    (a, b) => parseInt(b.year) - parseInt(a.year)
  );

  const [showModal, setShowModal] = useState(false);
  const [currentCitation, setCurrentCitation] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const citations = {
    "1": `@article{arun2025llms,
  title={LLMs for Generation of Architectural Components: An Exploratory Empirical Study in the Serverless World},
  author={Arun, Shrikara and Tedla, Meghana and Vaidhyanathan, Karthik},
  journal={arXiv preprint arXiv:2502.02539},
  year={2025}
}`,
    "2": `@article{adnan2025leveraging,
  title={Leveraging LLMs for Dynamic IoT Systems Generation through Mixed-Initiative Interaction},
  author={Adnan, Bassam and Miryala, Sathvika and Sambu, Aneesh and Vaidhyanathan, Karthik and De Sanctis, Martina and Spalazzese, Romina},
  journal={arXiv preprint arXiv:2502.00689},
  year={2025}
}`,
    "3": `@inproceedings{dhar2024leveraging,
  title={Leveraging Generative AI for Architecture Knowledge Management},
  author={Dhar, Rudra and Vaidhyanathan, Karthik and Varma, Vasudeva},
  booktitle={2024 IEEE 21st International Conference on Software Architecture Companion (ICSA-C)},
  pages={163--166},
  year={2024},
  organization={IEEE}
}`
  };

  const openCitationModal = (paperId) => {
    const citation = citations[paperId];
    setCurrentCitation(citation || "Citation not available");
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
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="prose max-w-none mb-12">
        <div className="text-lg mb-8">
          The following research papers form the foundation of our benchmark
          dataset
        </div>
      </div>

      <div className="relative">
        {sortedPapers.map((paper, index) => (
          <div key={paper.id} className="mb-8 relative">
            <div className="absolute -left-3 top-6 z-10">
              <div className="w-6 h-6 bg-primary rounded-full shadow-md" />
            </div>

            <div
              className="ml-6 p-6 bg-base-100 rounded-lg shadow-lg border-l-4 border-primary 
                         hover:shadow-xl hover:scale-[1.01] hover:bg-base-200/50 
                         transition-all duration-300 ease-in-out
                         dark:border-primary/50 dark:hover:border-primary"
            >
              <h3 className="text-xl font-semibold mb-2">
                <a
                  href={paper.arxivLink}
                  className="link link-primary hover:link-secondary transition-colors duration-300"
                >
                  {paper.title}
                </a>
              </h3>
              <div className="badge badge-secondary mb-2">{paper.year}</div>
              <div className="text-sm opacity-70 mb-2 hover:opacity-100 transition-opacity duration-300">
                {paper.authors.join(", ")}
              </div>
              <p className="mb-4">{paper.abstract}</p>
              <div className="flex gap-2">
                <a
                  href={paper.arxivLink}
                  className="btn btn-sm btn-outline hover:btn-primary transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  arxiv
                </a>
                <a
                  href={paper.githubLink}
                  className="btn btn-sm btn-outline hover:btn-primary transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github
                </a>
                <button
                  onClick={() => openCitationModal(paper.id)}
                  className="btn btn-sm btn-outline hover:btn-primary transition-colors duration-300"
                >
                  cite
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <dialog id="citation_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Citation</h3>
            <button
              onClick={copyToClipboard}
              className="btn btn-sm btn-outline"
              disabled={copySuccess}
            >
              {copySuccess ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span>📋 Copy</span>
              )}
            </button>
          </div>
          <div className="bg-base-200 p-4 rounded-lg overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {currentCitation}
            </pre>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Papers;