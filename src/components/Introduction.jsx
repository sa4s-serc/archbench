import React from "react";
import { useNavigate } from "react-router-dom";

const Introduction = () => {
  const navigate = useNavigate();

  return (
    <div className="hero bg-base-100">
      <div className="hero-content flex-col lg:flex-row">
        <div className="max-w-3xl w-full lg:w-2/5 flex-shrink-0">
          <img
            src="/sa4s_logo_final.svg"
            className="w-full h-auto"
            alt="SA4S Logo"
            style={{
              aspectRatio: "1",
            }}
          />
        </div>
        <div>
          <h1 className="text-5xl font-bold">
            ArchBench: LLMs for Software Architecture Tasks
          </h1>
          <p className="py-6 text-lg leading-relaxed">
            Archbench is a leaderboard focused on software architecture
            benchmarking.
            <br />
            Our categories include:
            <br />
            1. Architecture Design Decisions
            <br />
            2. Architectural Component Generation (Serverless Functions)
            <br />
            3. Dynamic Service Generation
            <br />
            We provide a simple way to access data, methods and results through
            our leaderboards.
          </p>
          <div className="flex justify-center gap-12">
            <button
              className="btn btn-outline btn-info px-6 text-lg" // Added px-6 for wider padding and text-lg for slightly bigger text
              onClick={() => navigate("/leaderboard")}
            >
              🏆 Leaderboard
            </button>
            <button
              className="btn btn-outline btn-success px-6 text-lg"
              onClick={() => navigate("/tasks")}
            >
              ✅ Tasks
            </button>
            <button
              className="btn btn-outline btn-error px-6 text-lg"
              onClick={() => navigate("/papers")}
            >
              📚 Papers
            </button>
            <button
              className="btn btn-outline btn-warning px-6 text-lg"
              onClick={() => navigate("/about")}
            >
              ℹ️ About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
