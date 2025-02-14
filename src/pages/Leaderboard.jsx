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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between mb-8 w-full">
        <button
          className={`flex-1 mx-2 px-6 py-2 rounded-lg border transition-all duration-200 ${
            selectedTask === "architecture"
              ? "bg-base-200 border-primary text-primary font-medium"
              : "border-base-300 hover:border-primary hover:text-primary"
          }`}
          onClick={() => handleTaskChange("architecture")}
        >
          ADR Generation
        </button>
        <button
          className={`flex-1 mx-2 px-6 py-2 rounded-lg border transition-all duration-200 ${
            selectedTask === "serverless"
              ? "bg-base-200 border-primary text-primary font-medium"
              : "border-base-300 hover:border-primary hover:text-primary"
          }`}
          onClick={() => handleTaskChange("serverless")}
        >
          Serverless
        </button>
        <button
          className={`flex-1 mx-2 px-6 py-2 rounded-lg border transition-all duration-200 ${
            selectedTask === "dynamic"
              ? "bg-base-200 border-primary text-primary font-medium"
              : "border-base-300 hover:border-primary hover:text-primary"
          }`}
          onClick={() => handleTaskChange("dynamic")}
        >
          Dynamic Service
        </button>
      </div>
      <div className="card bg-base-200 mb-8 p-6">
        <h2 className="text-2xl font-bold mb-4">
          {taskData[selectedTask].title}
        </h2>
        <p className="mb-4">{taskData[selectedTask].description}</p>

        <div className="grid grid-cols-3 gap-4">
          {taskData[selectedTask].metrics.map((metric) => (
            <div key={metric.name} className="card bg-base-100 p-4">
              <h3 className="font-bold">{metric.name}</h3>
              <p className="text-sm">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              {taskData[selectedTask].metrics.map((metric) => (
                <th
                  key={metric.name}
                  className="cursor-pointer hover:bg-base-200"
                  onClick={() => handleSort(metric.name.toLowerCase())}
                >
                  {metric.name}{" "}
                  {getSortIcon(metric.name.toLowerCase(), sortConfig)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.rank}</td>
                <td>{entry.name}</td>
                {taskData[selectedTask].metrics.map((metric) => (
                  <td key={metric.name}>{entry[metric.name.toLowerCase()]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
