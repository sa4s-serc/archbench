import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";
import { sortData, getSortIcon } from "../utils/sorting";
import Footer from "../components/Footer";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState("architecture");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const taskData = {
    architecture: adrGeneration,
    serverless: serverlessData,
    dynamic: dynamicData,
  };

  // Process entries based on task type
  const processEntries = (task, entries) => {
    if (task === "serverless") {
      return entries.map(entry => ({
        ...entry,
        codebase_tests_no_intervention: entry.no_intervention.codebase_tests,
        function_tests_no_intervention: entry.no_intervention.function_tests,
        codebase_tests_with_intervention: entry.with_intervention.codebase_tests,
        function_tests_with_intervention: entry.with_intervention.function_tests,
        source_lines_of_code: entry.no_intervention.source_lines_of_code,
        cyclomatic_complexity: entry.no_intervention.cyclomatic_complexity,
        cognitive_complexity: entry.no_intervention.cognitive_complexity,
        halstead_volume: entry.no_intervention.halstead_volume,
        codebleu: entry.no_intervention.codebleu
      }));
    }
    return entries;
  };

  const [tableData, setTableData] = useState(processEntries("architecture", adrGeneration.entries));

  const handleTaskChange = (task) => {
    setSelectedTask(task);
    setTableData(processEntries(task, taskData[task].entries));
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleSort = (key) => {
    const { sortedData, newSort } = sortData(tableData, key, sortConfig);
    setTableData(sortedData);
    setSortConfig(newSort);
  };

  const getMetrics = (task) => {
    if (task === "serverless") {
      return [
        { name: "Codebase Tests (No Int.)", key: "codebase_tests_no_intervention" },
        { name: "Function Tests (No Int.)", key: "function_tests_no_intervention" },
        { name: "Codebase Tests (With Int.)", key: "codebase_tests_with_intervention" },
        { name: "Function Tests (With Int.)", key: "function_tests_with_intervention" },
        { name: "Avg SLOC (No Int.)", key: "source_lines_of_code" },
        { name: "Avg Cyclo. Complexity", key: "cyclomatic_complexity" },
        { name: "Avg Cog. Complexity", key: "cognitive_complexity" },
        { name: "Avg Halstead Volume", key: "halstead_volume" },
        { name: "Avg CodeBLEU", key: "codebleu" },
      ];
    }

    // Add mapping for ADR metrics
    if (task === "architecture") {
      return [
        { name: "ROUGE-1", key: "rouge1" },
        { name: "BLEU", key: "bleu" },
        { name: "METEOR", key: "meteor" },
        { name: "BERTScore-P", key: "bertscore_p" },
        { name: "BERTScore-R", key: "bertscore_r" },
        { name: "BERTScore-F1", key: "bertscore_f1" }
      ];
    }

    // For other tasks, use the default mapping
    return taskData[task].metrics.map(metric => ({
      name: metric.name,
      key: metric.name.toLowerCase().replace(/-/g, '_')
    }));
  };

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
                Benchmark Leaderboard
              </h1>
              <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                <p className="text-lg">
                  Compare performance metrics across different models and approaches for our research tasks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Task Selection Tabs */}
        <div className="tabs tabs-boxed flex mb-8 bg-base-200 p-2 rounded-xl justify-center">
          <button
            className={`tab tab-lg flex-1 ${selectedTask === "architecture" ? "tab-active" : ""}`}
            onClick={() => handleTaskChange("architecture")}
          >
            ADR Generation
          </button>
          <button
            className={`tab tab-lg flex-1 ${selectedTask === "serverless" ? "tab-active" : ""}`}
            onClick={() => handleTaskChange("serverless")}
          >
            Serverless
          </button>
          <button
            className={`tab tab-lg flex-1 ${selectedTask === "dynamic" ? "tab-active" : ""}`}
            onClick={() => handleTaskChange("dynamic")}
          >
            Dynamic Service
          </button>
        </div>

        {/* Task Info Card */}
        <div className="card bg-base-100 shadow-xl mb-8 border border-base-300">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-primary">
                  {taskData[selectedTask].title}
                </h2>
                <p className="mb-4 opacity-90">
                  {taskData[selectedTask].short_description}
                </p>
              </div>
              <button
                onClick={() => navigate(`/tasks`)}
                className="btn btn-primary btn-sm gap-2 self-start"
              >
                <span>📋</span> View Full Task Details
              </button>
            </div>

            <div className="divider">Evaluation Metrics</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taskData[selectedTask].metrics.slice(0, 6).map((metric) => (
                <div key={metric.name} className="bg-base-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="font-bold text-base mb-1">{metric.name}</h3>
                  <p className="text-sm opacity-90">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th className="sticky left-0 z-10 bg-base-200">#</th>
                    <th className="sticky left-10 z-10 bg-base-200">Model / Approach</th>
                    {getMetrics(selectedTask).map(({ name, key }) => (
                      <th
                        key={key}
                        className="cursor-pointer hover:bg-base-300 text-xs whitespace-nowrap"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-1">
                          {name}
                          <span className="text-xs opacity-80">{getSortIcon(key, sortConfig)}</span>
                        </div>
                      </th>
                    ))}
                    <th
                      className="cursor-pointer hover:bg-base-300 whitespace-nowrap"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <span className="text-xs opacity-80">{getSortIcon("date", sortConfig)}</span>
                      </div>
                    </th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((entry, index) => (
                    <tr
                      key={index}
                      className="hover:bg-base-200 transition-colors duration-200"
                    >
                      <td className="font-mono font-bold text-center">{index + 1}</td>
                      <td className="font-medium whitespace-nowrap sticky left-0 z-10 bg-base-100 hover:bg-base-200">
                        {entry.name}
                      </td>
                      {getMetrics(selectedTask).map(({ key }) => (
                        <td key={key} className="text-right">
                          <div className="badge badge-ghost font-mono">
                            {typeof entry[key] === 'number'
                              ? parseFloat(entry[key]).toFixed(3)
                              : entry[key] || 'N/A'}
                          </div>
                        </td>
                      ))}
                      <td className="whitespace-nowrap">{entry.date}</td>
                      <td>
                        {entry.link ? (
                          <a
                            href={entry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline"
                          >
                            🔗
                          </a>
                        ) : (
                          <span className="opacity-50">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 card bg-base-100 p-4 shadow-sm border border-base-300">
          <div className="text-sm opacity-70">
            <span className="font-semibold">Note:</span> "No Int." refers to results without human intervention, while "With Int." indicates results that included human review and modifications.
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Leaderboard;