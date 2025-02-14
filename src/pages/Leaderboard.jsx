import React, { useState } from "react";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";
import { sortData, getSortIcon } from "../utils/sorting";

const Leaderboard = () => {
  const [selectedTask, setSelectedTask] = useState("architecture");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [tableData, setTableData] = useState(adrGeneration.entries);

  const taskData = {
    architecture: adrGeneration,
    serverless: serverlessData,
    dynamic: dynamicData,
  };

  const handleTaskChange = (task) => {
    setSelectedTask(task);
    setTableData(taskData[task].entries);
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleSort = (key) => {
    const { sortedData, newSort } = sortData(tableData, key, sortConfig);
    setTableData(sortedData);
    setSortConfig(newSort);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Task selection buttons - make them stack on mobile */}
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
          {taskData[selectedTask].description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskData[selectedTask].metrics.map((metric) => (
            <div key={metric.name} className="card bg-base-100 p-4">
              <h3 className="font-bold text-sm sm:text-base">{metric.name}</h3>
              <p className="text-xs sm:text-sm">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full sm:min-w-0 px-4 sm:px-0">
          <table className="table table-zebra w-full text-sm sm:text-base">
            <thead>
              <tr>
                <th className="w-12"></th>
                <th className="whitespace-nowrap">Name</th>
                {taskData[selectedTask].metrics.map((metric) => (
                  <th
                    key={metric.name}
                    className="cursor-pointer hover:bg-base-200 whitespace-nowrap"
                    onClick={() => handleSort(metric.name.toLowerCase())}
                  >
                    {metric.name}{" "}
                    {getSortIcon(metric.name.toLowerCase(), sortConfig)}
                  </th>
                ))}
                <th
                  className="cursor-pointer hover:bg-base-200 whitespace-nowrap"
                  onClick={() => handleSort("date")}
                >
                  Date {getSortIcon("date", sortConfig)}
                </th>
                <th className="whitespace-nowrap">Link</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((entry, index) => (
                <tr key={index}>
                  <td className="text-center text-sm text-base-content/70">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap">{entry.name}</td>
                  {taskData[selectedTask].metrics.map((metric) => (
                    <td key={metric.name} className="whitespace-nowrap">
                      {entry[metric.name.toLowerCase()]}
                    </td>
                  ))}
                  <td className="whitespace-nowrap">{entry.date}</td>
                  <td className="whitespace-nowrap">
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
