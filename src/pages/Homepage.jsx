import React from "react";
import Introduction from "../components/Introduction";
import adrGeneration from "../data/adrGenData.json";
import dynamicData from "../data/dynamicGenData.json";
import serverlessData from "../data/serverlessData.json";
import traceabilityData from "../data/traceabilityData.json";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

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

  return (
    <>
      <div className="min-h-screen bg-base-100">
        <Introduction />

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Total Submissions</div>
              <div className="stat-value">
                {adrGeneration.entries.length + dynamicData.entries.length + serverlessData.entries.length + traceabilityData.entries.length}
              </div>
              <div className="stat-desc">Across all categories</div>
            </div>

            <div className="stat">
              <div className="stat-title">Latest Submission</div>
              <div className="stat-value text-accent">
                {
                  new Date(
                    Math.max(
                      ...adrGeneration.entries.map((e) =>
                        new Date(e.date).getTime()
                      ),
                      ...serverlessData.entries.map((e) =>
                        new Date(e.date).getTime()
                      ),
                      ...dynamicData.entries.map((e) =>
                        new Date(e.date).getTime()
                      ),
                      ...traceabilityData.entries.map((e) =>
                        new Date(e.date).getTime()
                      )
                    )
                  )
                    .toISOString()
                    .split("T")[0]
                }
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Categories</div>
              <div className="stat-value">4</div>
              <div className="stat-desc">
                ADR Generation, Serverless Component Generation, Dynamic Service
                Generation & Architecture Traceability
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-200 py-12 text-center">
          <div className="text-center flex-1 order-1 lg:order-2">
            <h2 className="text-3xl font-bold mb-6">Looking to Contribute?</h2>
            <p className="mb-8 text-lg">
              Join our benchmark and help advance software architecture research
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="btn btn-primary" onClick={openSubmitModal}>
                Submit Results
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate("/leaderboard")}
              >
                View Leaderboard →
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Submission Modal */}
      <dialog id="submit_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Submission Instructions</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
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
              <span className="font-semibold text-lg">bassam.adnan@research.iiit.ac.in</span>
            </div>
            <p>
              Please include the following information in your submission email:
            </p>
            <ul>
              <li>
                Task category (ADR Generation, Serverless Component Generation, Dynamic Service Generation, or Architecture Traceability)
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
                All submissions will be properly cited in our website. 
                Please ensure your submission is original work and does not contain 
                plagiarized material.
              </p>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Homepage;
