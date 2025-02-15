import React from "react";
import papersData from "../data/papersData.json";

const Papers = () => {
  const sortedPapers = [...papersData.papers].sort(
    (a, b) => parseInt(b.year) - parseInt(a.year)
  );

  return (
    <div className="container mx-auto p-4">
      <div className="prose max-w-none mb-12">
        {/* <h2 className="text-3xl font-bold mb- 6">Papers</h2> */}
        <div className="text-lg mb-8">
          The following research papers form the foundation of our benchmark
          dataset
        </div>
      </div>

      <div className="relative">
        {sortedPapers.map((paper, index) => (
          <div key={paper.id} className="mb-8 relative">
            {/* Static wrapper for the circle */}
            <div className="absolute -left-3 top-6 z-10">
              <div className="w-6 h-6 bg-primary rounded-full shadow-md" />
            </div>

            {/* Card content that scales */}
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Papers;
