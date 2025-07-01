import React from "react";
import Introduction from "../components/Introduction";
import adrGeneration from "../data/adrGenData.json";
import dynamicData from "../data/dynamicGenData.json";
import serverlessData from "../data/serverlessData.json";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Homepage = () => {
  const navigate = useNavigate();

  const openSubmitModal = () => {
    document.getElementById("submit_modal").showModal();
  };

  const closeModal = (e) => {
    const modal = document.getElementById("submit_modal");
    if (e.target === modal) {
      modal.close();
    }
  };

  // Calculate the latest submission date once
  const latestSubmissionDate = new Date(
    Math.max(
      ...adrGeneration.entries.map((e) => new Date(e.date).getTime()),
      ...serverlessData.entries.map((e) => new Date(e.date).getTime()),
      ...dynamicData.entries.map((e) => new Date(e.date).getTime())
    )
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Introduction />

      {/* Categories Preview */}
      <section className="py-12 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Benchmark Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary">ADR Generation</h3>
                <p className="mb-4 line-clamp-3">
                  {adrGeneration.short_description}
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate("/tasks")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary">Serverless Components</h3>
                <p className="mb-4 line-clamp-3">
                  {serverlessData.short_description}
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate("/tasks")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary">Dynamic Services</h3>
                <p className="mb-4 line-clamp-3">
                  {dynamicData.short_description}
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate("/tasks")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
              <div className="card-body text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {
                    adrGeneration.entries.length +
                    dynamicData.entries.length +
                    serverlessData.entries.length
                  }
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  Total Submissions
                </h3>
                <p className="text-xs md:text-sm opacity-75">Across all categories</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
              <div className="card-body text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  {latestSubmissionDate}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  Latest Submission
                </h3>
                <p className="text-xs md:text-sm opacity-75">
                  Most recent benchmark update
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
              <div className="card-body text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">3</div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">Categories</h3>
                <p className="text-xs md:text-sm opacity-75">
                  ADR, Serverless Components & Dynamic Services
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Submission Modal */}
      <dialog id="submit_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Submission Instructions</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </form>
          </div>
          <div className="prose max-w-none">
            <h3>How to Submit Your Results</h3>
            <p>
              To make a submission to our benchmark, please contact us via email
              at:
            </p>
            <div className="bg-base-200 p-4 my-4 rounded-lg text-center">
              <span className="font-semibold text-lg">
                bassam.adnan@research.iiit.ac.in
              </span>
            </div>
            <p>
              Please include the following information in your submission email:
            </p>
            <ul>
              <li>
                Task category (ADR, Serverless, or Dynamic Service Generation)
              </li>
              <li>Team or organization name</li>
              <li>Brief description of your approach</li>
              <li>Performance metrics</li>
              <li>Link to your implementation (if publicly available)</li>
            </ul>
            <p>
              We review all submissions and will contact
              you if we need any additional information.
            </p>
            <div className="mt-6 bg-base-200 p-4 rounded-lg">
              <p className="font-semibold">Important Note:</p>
              <p className="text-sm mt-2">
                All submissions will be properly cited on our website. Please
                ensure your submission is original work and does not contain
                plagiarized material.
              </p>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Homepage;
