import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faCheckCircle,
  faBook,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

const Introduction = () => {
  const navigate = useNavigate();

  return (
    <div className="hero bg-base-100 h-screen overflow-auto">
      <div className="hero-content flex-col lg:flex-row max-w-[1200px] px-4">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto lg:mx-0 lg:w-2/5 flex-shrink-0">
          <img
            src="/sa4s_logo_final.svg"
            className="w-full h-auto max-h-[250px] md:max-h-[500px] object-contain mx-auto"
            alt="SA4S Logo"
            style={{
              maxWidth: "100%",
              transition: "transform 0.3s ease",
            }}
            loading="lazy"
          />
        </div>
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-7xl font-bold">
            ArchBench: LLMs for Software Architecture Tasks
          </h1>
          <p className="py-4 md:py-6 text-lg lg:text-xl leading-relaxed">
            Archbench is a leaderboard focused on software architecture
            benchmarking. We provide a simple way to access data, methods and results through
            our leaderboards.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-6">
            <button
              className="btn btn-outline btn-info px-2 md:px-4 text-sm md:text-base"
              onClick={() => navigate("/leaderboard")}
            >
              <FontAwesomeIcon icon={faTrophy} className="mr-2" /> Leaderboard
            </button>
            <button
              className="btn btn-outline btn-success px-2 md:px-4 text-sm md:text-base"
              onClick={() => navigate("/tasks")}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Tasks
            </button>
            <button
              className="btn btn-outline btn-error px-2 md:px-4 text-sm md:text-base"
              onClick={() => navigate("/papers")}
            >
              <FontAwesomeIcon icon={faBook} className="mr-2" /> Papers
            </button>
            <button
              className="btn btn-outline btn-warning px-2 md:px-4 text-sm md:text-base"
              onClick={() => navigate("/about")}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
