import React, { useRef } from "react";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";

const Tasks = () => {
  const tasks = [adrGeneration, serverlessData, dynamicData];
  const taskRefs = useRef([]);

  const scrollToTask = (index) => {
    taskRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto relative">
      <div className="fixed left-4 top-24 h-fit hidden lg:block w-40 p-3 card bg-base-100 border border-base-300 shadow-sm">
        <h3 className="font-bold text-sm mb-2">Jump to: </h3>
        <ul className="menu menu-sm p-0">
          {tasks.map((task, index) => (
            <li key={index}>
              <button
                onClick={() => scrollToTask(index)}
                className="cursor-pointer hover:text-primary py-1 w-full text-left"
              >
                {index + 1}. {task.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-8 lg:ml-48">
        {tasks.map((task, index) => (
          <div
            key={index}
            ref={(el) => (taskRefs.current[index] = el)}
            className="card bg-base-100 shadow-xl border border-base-400"
          >
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <h2 className="card-title text-xl sm:text-2xl mb-2 sm:mb-4">
                    {task.title}
                  </h2>
                  <p className="text-base sm:text-lg mb-4 sm:mb-6">
                    {task.long_description}
                  </p>
                </div>
                <a
                  href={task.paper_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost self-start"
                >
                  📝 View Paper
                </a>
              </div>

              <div className="divider">Evaluation Metrics</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {task.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-base-200 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">{metric.name}</h3>
                    <p className="text-sm opacity-90">{metric.description}</p>
                  </div>
                ))}
              </div>

              <div className="divider">Task Details</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-base-200 p-4 rounded-lg">
                  <span className="font-semibold">Input Format:</span>
                  <p className="mt-1 opacity-90">
                    Architecture documentation in markdown format
                  </p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <span className="font-semibold">Output Format:</span>
                  <p className="mt-1 opacity-90">
                    Generated ADRs in markdown format
                  </p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <span className="font-semibold">Dataset Size:</span>
                  <p className="mt-1 opacity-90">1000 architecture documents</p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <span className="font-semibold">Time Limit:</span>
                  <p className="mt-1 opacity-90">2 hours per submission</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
                <button className="btn btn-outline w-full sm:w-auto">
                  🔍 View Example
                </button>
                <button className="btn btn-primary w-full sm:w-auto">
                  📥 Download Dataset
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
