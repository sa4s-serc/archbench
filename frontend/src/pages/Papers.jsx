import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSearch } from "@fortawesome/free-solid-svg-icons";

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCitation, setCurrentCitation] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = 'http://localhost:5000/api';

  // Fetch papers from API
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/papers`);

        if (!response.ok) {
          throw new Error('Failed to fetch papers');
        }

        const data = await response.json();
        const sortedPapers = [...data.data.papers].sort(
          (a, b) => parseInt(b.year) - parseInt(a.year)
        );
        setPapers(sortedPapers);
        setError(null);
      } catch (err) {
        console.error('Error fetching papers:', err);
        setError('Failed to load papers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const openCitationModal = (paper) => {
    setCurrentCitation(paper.citation || "Citation not available");
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

  // Filter papers by year and search term
  const filteredPapers = papers.filter(paper => {
    const matchesYear = filterYear === "all" || paper.year === filterYear;

    if (!searchTerm) return matchesYear;

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTermLower) ||
      paper.abstract.toLowerCase().includes(searchTermLower) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTermLower));

    return matchesYear && matchesSearch;
  });

  // Get unique years for filter
  const years = [...new Set(papers.map(paper => paper.year))].sort((a, b) => b - a);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
          <div className="flex flex-col items-center gap-4">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-primary" />
            <p className="font-medium text-lg">Loading papers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
          <div className="flex flex-col items-center gap-4">
            <div className="text-error text-4xl">⚠️</div>
            <p className="font-medium text-lg text-error">{error}</p>
            <button
              className="btn btn-outline btn-error"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="py-12 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-base-100 p-6 rounded-2xl shadow-xl border border-base-300">
            <div className="md:w-1/3 flex justify-center">
              <img
                src="/sa4s_logo_final.svg"
                alt="SA4S Logo"
                className="w-48 max-w-full h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Research Papers
              </h1>
              <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                <p className="text-lg">
                  The following research papers form the foundation of our benchmark datasets and methodologies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <div className="w-full mb-8 max-w-3xl mx-auto px-4">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <input
                  type="text"
                  placeholder="Search papers..."
                  className="input input-primary w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="select select-bordered w-full md:w-48"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button className="btn btn-primary">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Papers List - One paper per row */}
      <div className="max-w-7xl mx-auto px-4">
        {filteredPapers.map((paper) => (
          <section
            key={paper._id}
            className="mb-8"
          >
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="badge badge-primary">{paper.year}</div>
                      {paper.conference && (
                        <div className="badge badge-outline">{paper.conference}</div>
                      )}
                    </div>
                    <h2 className="card-title text-2xl font-bold text-primary mb-2 hover:text-primary/90 transition-colors">
                      <a
                        href={paper.arxivLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {paper.title}
                      </a>
                    </h2>
                    <p className="text-sm opacity-80">
                      {paper.authors.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="divider my-0"></div>

                <div className="prose max-w-none">
                  <p>{paper.abstract}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <a
                    href={paper.arxivLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    View on arXiv
                  </a>
                  {paper.githubLink && (
                    <a
                      href={paper.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      GitHub Repository
                    </a>
                  )}
                  <button
                    onClick={() => openCitationModal(paper)}
                    className="btn btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"></path><path d="M8 9h8"></path><path d="M8 15h8"></path></svg>
                    Cite This Paper
                  </button>
                </div>
              </div>
            </div>
          </section>
        ))}

        {filteredPapers.length === 0 && (
          <div className="card bg-base-100 shadow-xl border border-base-300 p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-2">No Papers Found</h2>
              <p className="text-base-content/70 mb-6">Try adjusting your search or filter criteria</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFilterYear("all");
                  setSearchTerm("");
                }}
              >
                Show All Papers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Citation Modal */}
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

          <div className="bg-base-200 p-4 rounded-lg overflow-x-auto border border-base-300">
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