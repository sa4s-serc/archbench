import React, { useState } from "react";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";
import { sortData, getSortIcon } from "../utils/sorting";

const Leaderboard = () => {
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
        function_tests_with_intervention: entry.with_intervention.function_tests
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

  // Get metrics based on task type
  const getMetrics = (task) => {
    if (task === "serverless") {
      return [
        { name: "Codebase Tests (No Int.)", key: "codebase_tests_no_intervention" },
        { name: "Function Tests (No Int.)", key: "function_tests_no_intervention" },
        { name: "Codebase Tests (With Int.)", key: "codebase_tests_with_intervention" },
        { name: "Function Tests (With Int.)", key: "function_tests_with_intervention" }
      ];
    }
    return taskData[task].metrics.map(metric => ({
      name: metric.name,
      key: metric.name.toLowerCase().replace(/-/g, '_')
    }));
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between mb-8 w-full gap-2 sm:gap-0">
        <button
          className={`sm:flex-1 mx-0 sm:mx-2 px-4 sm:px-6 py-2 rounded-lg border transition-all duration-200 ${
            selectedTask === "architecture"
              ? "bg-base-200 border-primary text-primary font-medium"
              : "border-base-300 hover:border-primary hover:text-primary"
          }`}
          onClick={() => handleTaskChange("architecture")}
        >
          ADR Generation
        </button>
        <button
          className={`sm:flex-1 mx-0 sm:mx-2 px-4 sm:px-6 py-2 rounded-lg border transition-all duration-200 ${
            selectedTask === "serverless"
              ? "bg-base-200 border-primary text-primary font-medium"
              : "border-base-300 hover:border-primary hover:text-primary"
          }`}
          onClick={() => handleTaskChange("serverless")}
        >
          Serverless
        </button>
        <button
          className={`sm:flex-1 mx-0 sm:mx-2 px-4 sm:px-6 py-2 rounded-lg border transition-all duration-200 ${
            selectedTask === "dynamic"
              ? "bg-base-200 border-primary text-primary font-medium"
              : "border-base-300 hover:border-primary hover:text-primary"
          }`}
          onClick={() => handleTaskChange("dynamic")}
        >
          Dynamic Service
        </button>
      </div>

      <div className="card bg-base-200 mb-8 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
          {taskData[selectedTask].title}
        </h2>
        <p className="text-sm sm:text-base mb-4">
          {taskData[selectedTask].short_description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskData[selectedTask].metrics.map((metric) => (
            <div key={metric.name} className="card bg-base-100 p-4">
              <h3 className="font-bold text-sm sm:text-base">{metric.name}</h3>
              <p className="text-xs sm:text-sm text-base-content/70">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full sm:min-w-0 px-4 sm:px-0">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-12 text-xs">#</th>
                <th className="text-xs">Name</th>
                {getMetrics(selectedTask).map(({ name, key }) => (
                  <th
                    key={key}
                    className="cursor-pointer hover:bg-base-200 text-xs whitespace-nowrap"
                    onClick={() => handleSort(key)}
                  >
                    {name} {getSortIcon(key, sortConfig)}
                  </th>
                ))}
                <th
                  className="cursor-pointer hover:bg-base-200 text-xs whitespace-nowrap"
                  onClick={() => handleSort("date")}
                >
                  Date {getSortIcon("date", sortConfig)}
                </th>
                <th className="text-xs">Link</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tableData.map((entry, index) => (
                <tr key={index}>
                  <td className="text-center text-base-content/70">{index + 1}</td>
                  <td className="font-medium">{entry.name}</td>
                  {getMetrics(selectedTask).map(({ key }) => (
                    <td key={key}>
                      {typeof entry[key] === 'number' 
                        ? Number(entry[key]).toFixed(3)
                        : entry[key]}
                    </td>
                  ))}
                  <td>{entry.date}</td>
                  <td>
                    {entry.link ? (
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        🔗
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;