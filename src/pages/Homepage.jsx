import React from "react";
import { useNavigate } from "react-router-dom";
import Introduction from "../components/Introduction";
import adrGeneration from "../data/adrGenData.json";
import dynamicData from "../data/dynamicGenData.json";
import serverlessData from "../data/serverlessData.json";

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100">
      <Introduction />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Submissions</div>
            <div className="stat-value">
              {adrGeneration.entries.length + dynamicData.entries.length}
            </div>
            <div className="stat-desc">Across all categories</div>
          </div>

          <div className="stat">
            <div className="stat-title">Latest Submission</div>
            <div className="stat-value text-accent">
              {
                new Date(
                  Math.max(
                    ...adrGeneration.entries.map((e) => new Date(e.date)),
                    ...serverlessData.entries.map((e) => new Date(e.date)),
                    ...dynamicData.entries.map((e) => new Date(e.date))
                  )
                )
                  .toISOString()
                  .split("T")[0]
              }
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Categories</div>
            <div className="stat-value">3</div>
            <div className="stat-desc">
              ADR & Serverless & Dynamic Service Generation
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-base-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Looking to Contribute?</h2>
          <p className="mb-8 text-lg">
            Join our benchmark and help advance software architecture research
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn btn-primary">Submit Results</button>
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
  );
};

export default Homepage;
