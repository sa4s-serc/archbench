import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";
import traceabilityData from "../data/traceabilityData.json";
import microserviceData from "../data/microserviceData.json";
import { sortData, getSortIcon } from "../utils/sorting";
import TopBar from "../components/TopBar";
import {
  Layers,
  GitBranch,
  Sparkles,
  BarChart3,
  Boxes,
  ChevronRight,
  ExternalLink,
  ClipboardList,
  Medal,
  Search,
  X,
} from "lucide-react";

const taskMeta = [
  { key: "architecture", icon: Layers, color: "from-blue-500 to-cyan-400", data: adrGeneration },
  { key: "serverless", icon: GitBranch, color: "from-purple-500 to-pink-400", data: serverlessData },
  { key: "dynamic", icon: Sparkles, color: "from-orange-500 to-yellow-400", data: dynamicData },
  { key: "traceability", icon: BarChart3, color: "from-green-500 to-emerald-400", data: traceabilityData },
  { key: "microservice", icon: Boxes, color: "from-red-500 to-rose-400", data: microserviceData },
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [microserviceView, setMicroserviceView] = useState("incremental");
  const [serverlessView, setServerlessView] = useState("no_intervention");
  const [traceabilityView, setTraceabilityView] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const selectedTask = taskMeta[selectedIdx].key;
  const taskData = taskMeta[selectedIdx].data;

  const processEntries = (key, entries) => {
    if (key === "serverless") {
      return entries.map((entry) => ({
        ...entry,
        codebase_tests_no_intervention: entry.no_intervention.codebase_tests,
        function_tests_no_intervention: entry.no_intervention.function_tests,
        codebase_tests_with_intervention: entry.with_intervention.codebase_tests,
        function_tests_with_intervention: entry.with_intervention.function_tests,
        source_lines_of_code: entry.no_intervention.source_lines_of_code,
        cyclomatic_complexity: entry.no_intervention.cyclomatic_complexity,
        cognitive_complexity: entry.no_intervention.cognitive_complexity,
        halstead_volume: entry.no_intervention.halstead_volume,
        codebleu: entry.no_intervention.codebleu,
      }));
    }
    if (key === "microservice") {
      return entries.map((entry) => ({
        ...entry,
        inc_p1: entry.incremental.test_pass_rate_p1,
        inc_p2: entry.incremental.test_pass_rate_p2,
        cs_p1: entry.clean_state.test_pass_rate_p1,
        cs_p2: entry.clean_state.test_pass_rate_p2,
        avg_time_min: entry.avg_time_min,
        avg_cost_usd: entry.avg_cost_usd,
      }));
    }
    return entries;
  };

  const [tableData, setTableData] = useState(
    processEntries("architecture", adrGeneration.entries)
  );

  const handleTaskChange = (idx) => {
    setSelectedIdx(idx);
    const meta = taskMeta[idx];
    setTableData(processEntries(meta.key, meta.data.entries));
    setSortConfig({ key: null, direction: "asc" });
    setSearchQuery("");
    setCategorySearchQuery("");
    setMicroserviceView("incremental");
    setServerlessView("no_intervention");
    setTraceabilityView("all");
  };

  const handleSort = (key) => {
    const { sortedData, newSort } = sortData(tableData, key, sortConfig);
    setTableData(sortedData);
    setSortConfig(newSort);
  };

  const getMetrics = (task) => {
    if (task === "serverless") {
      if (serverlessView === "no_intervention") {
        return [
          { name: "Codebase Tests", key: "codebase_tests_no_intervention" },
          { name: "Function Tests", key: "function_tests_no_intervention" },
          { name: "Avg SLOC", key: "source_lines_of_code" },
          { name: "Avg Cyclomatic", key: "cyclomatic_complexity" },
          { name: "Avg Cognitive", key: "cognitive_complexity" },
          { name: "Avg Halstead", key: "halstead_volume" },
          { name: "Avg CodeBLEU", key: "codebleu" },
        ];
      }
      return [
        { name: "Codebase Tests", key: "codebase_tests_with_intervention" },
        { name: "Function Tests", key: "function_tests_with_intervention" },
      ];
    }
    if (task === "architecture") {
      return [
        { name: "ROUGE-1", key: "rouge1" },
        { name: "BLEU", key: "bleu" },
        { name: "METEOR", key: "meteor" },
        { name: "BERTScore-P", key: "bertscore_p" },
        { name: "BERTScore-R", key: "bertscore_r" },
        { name: "BERTScore-F1", key: "bertscore_f1" },
      ];
    }
    if (task === "traceability") {
      return [
        { name: "Precision", key: "precision" },
        { name: "Recall", key: "recall" },
        { name: "F1-Score", key: "f1" },
        { name: "Weighted Avg F1", key: "weighted_avg_f1" },
      ];
    }
    if (task === "microservice") {
      if (microserviceView === "incremental") {
        return [
          { name: "Test Pass Rate (P1)", key: "inc_p1" },
          { name: "Test Pass Rate (P2)", key: "inc_p2" },
          { name: "Avg Time (min)", key: "avg_time_min" },
          { name: "Avg Cost ($)", key: "avg_cost_usd" },
        ];
      }
      return [
        { name: "Test Pass Rate (P1)", key: "cs_p1" },
        { name: "Test Pass Rate (P2)", key: "cs_p2" },
        { name: "Avg Time (min)", key: "avg_time_min" },
        { name: "Avg Cost ($)", key: "avg_cost_usd" },
      ];
    }
    return taskData.metrics.map((metric) => ({
      name: metric.name,
      key: metric.name.toLowerCase().replace(/-/g, "_"),
    }));
  };

  // Filter by search - first by category if searching across categories
  const filteredByCategory = taskMeta.filter((meta) =>
    meta.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meta.data.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search has no results
  const hasNoCategoryResults = searchQuery && filteredByCategory.length === 0;

  // Get the filtered task index (or fall back to selected if search is empty)
  const displayIdx = searchQuery ? (filteredByCategory.length > 0 ? taskMeta.indexOf(filteredByCategory[0]) : selectedIdx) : selectedIdx;
  const displayTask = taskMeta[displayIdx];
  const displayTableData = tableData;

  // Filter table entries by category search query and traceability approach
  const filteredData = displayTableData.filter((entry) => {
    if (!entry.name.toLowerCase().includes(categorySearchQuery.toLowerCase())) return false;
    if (selectedTask === "traceability" && traceabilityView !== "all") {
      const approach = entry.approach || "";
      if (traceabilityView === "sad") return approach.includes("from documentation");
      if (traceabilityView === "code") return approach.includes("from source code");
      if (traceabilityView === "baseline") return approach.includes("Manual") || approach.includes("Direct");
    }
    return true;
  });

  const getRankBadge = (index) => {
    if (index === 0) return <span className="text-yellow-500">🥇</span>;
    if (index === 1) return <span className="text-gray-400">🥈</span>;
    if (index === 2) return <span className="text-amber-600">🥉</span>;
    return <span className="text-base-content/40">{index + 1}</span>;
  };

  return (
    <>
      <TopBar
        title="Leaderboard"
        subtitle={taskData.title}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leaderboard categories..."
      >
        <button
          onClick={() => navigate("/tasks")}
          className="btn btn-sm btn-ghost rounded-xl gap-1.5 hidden sm:inline-flex"
        >
          <ClipboardList size={14} />
          View Tasks
        </button>
      </TopBar>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left category panel */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-base-300/50 bg-base-200/30">
          <div className="p-4 space-y-2">
            <p className="text-xs text-base-content/40 uppercase tracking-wider font-medium px-3 mb-2">
              Categories
            </p>
            {filteredByCategory.map((meta, idx) => {
              const Icon = meta.icon;
              const active = meta.key === displayTask.key;
              return (
                <div key={meta.key} className="tooltip tooltip-right w-full" data-tip={meta.data.title}>
                  <button
                    onClick={() => handleTaskChange(taskMeta.indexOf(meta))}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${active
                        ? "bg-primary/10 text-primary font-semibold shadow-sm"
                        : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"
                      }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? "bg-primary/15" : "bg-base-300/50 group-hover:bg-primary/10"
                        }`}
                    >
                      <Icon size={16} className={active ? "text-primary" : "text-base-content/50 group-hover:text-primary/70"} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm truncate block">{meta.data.title}</span>
                      <span className="text-[10px] text-base-content/40">
                        {meta.data.entries.length} entries
                      </span>
                    </div>
                    {active && (
                      <ChevronRight size={14} className="ml-auto text-primary/50 shrink-0" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Mobile category selector */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-200/90 backdrop-blur-xl border-t border-base-300/50 px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
          {taskMeta.map((meta) => {
            const Icon = meta.icon;
            const active = meta.key === displayTask.key;
            return (
              <div key={meta.key} className="tooltip tooltip-top" data-tip={meta.data.title}>
                <button
                  onClick={() => handleTaskChange(taskMeta.indexOf(meta))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-base-content/50"
                    }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{meta.data.title}</span>
                  <span className="sm:hidden">{meta.data.title.split(" ")[0]}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto pb-20 md:pb-8">
          {hasNoCategoryResults ? (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-8rem)]">
              <div className="text-center">
                <p className="text-xl font-semibold text-base-content/60 mb-2">No leaderboards found</p>
                <p className="text-sm text-base-content/40 mb-6">
                  No leaderboard categories match "{searchQuery}". Try a different search term.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-sm btn-outline rounded-xl"
                >
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <>
            {/* Summary card */}
            <div className="rounded-2xl bg-base-200/50 border border-base-300/50 p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Medal size={22} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{displayTask.data.title}</h2>
                  <p className="text-sm text-base-content/50">
                    {displayTask.data.short_description}
                  </p>
                </div>
              </div>
            </div>

          {/* Leaderboard Entry Searchbar */}
          <div className="mb-6">
            <p className="text-xs text-base-content/40 uppercase tracking-wider font-medium px-1 mb-3">
              Filter Entries
            </p>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search entries by name..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="input input-bordered input-sm w-full pl-10 pr-10 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {categorySearchQuery && (
                <button
                  onClick={() => setCategorySearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Microservice scenario toggle */}
          {selectedTask === "microservice" && (
            <div className="flex gap-2 mb-4">
              {[
                { key: "incremental", label: "Incremental" },
                { key: "clean_state", label: "Clean State" },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => {
                    setMicroserviceView(view.key);
                    setSortConfig({ key: null, direction: "asc" });
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    microserviceView === view.key
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-base-content/50 border border-base-300/50 hover:bg-base-200/50"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          )}

          {/* Serverless intervention toggle */}
          {selectedTask === "serverless" && (
            <div className="flex gap-2 mb-4">
              {[
                { key: "no_intervention", label: "No Intervention" },
                { key: "with_intervention", label: "With Intervention" },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => {
                    setServerlessView(view.key);
                    setSortConfig({ key: null, direction: "asc" });
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    serverlessView === view.key
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-base-content/50 border border-base-300/50 hover:bg-base-200/50"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          )}

          {/* Traceability approach toggle */}
          {selectedTask === "traceability" && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "sad", label: "SAD-extracted" },
                { key: "code", label: "Code-extracted" },
                { key: "baseline", label: "Baselines" },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => {
                    setTraceabilityView(view.key);
                    setSortConfig({ key: null, direction: "asc" });
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    traceabilityView === view.key
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-base-content/50 border border-base-300/50 hover:bg-base-200/50"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl border border-base-300/50 overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="table w-full min-w-[640px]">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-14 text-xs font-semibold text-base-content/50">#</th>
                    <th className="text-xs font-semibold text-base-content/50">Name</th>
                    {getMetrics(selectedTask).map(({ name, key }) => (
                      <th
                        key={key}
                        className="cursor-pointer hover:bg-base-300/30 text-xs font-semibold text-base-content/50 whitespace-nowrap transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        <span className="flex items-center gap-1">
                          {name}
                          <span className="text-[10px]">{getSortIcon(key, sortConfig)}</span>
                        </span>
                      </th>
                    ))}
                    <th
                      className="cursor-pointer hover:bg-base-300/30 text-xs font-semibold text-base-content/50 whitespace-nowrap transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      <span className="flex items-center gap-1">
                        Date
                        <span className="text-[10px]">{getSortIcon("date", sortConfig)}</span>
                      </span>
                    </th>
                    <th className="text-xs font-semibold text-base-content/50 w-14">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry) => {
                    const originalIndex = displayTableData.findIndex(e => e.name === entry.name);
                    return (
                    <tr
                      key={originalIndex}
                      className="hover:bg-base-200/30 transition-colors"
                    >
                      <td className="text-center font-medium">
                        {getRankBadge(originalIndex)}
                      </td>
                      <td className="font-semibold text-sm">{entry.name}</td>
                      {getMetrics(selectedTask).map(({ key }) => (
                        <td key={key} className="text-sm tabular-nums">
                          {typeof entry[key] === "number"
                            ? Number(entry[key]).toFixed(3)
                            : entry[key]}
                        </td>
                      ))}
                      <td className="text-sm text-base-content/60">{entry.date}</td>
                      <td>
                        {entry.link ? (
                          <a
                            href={entry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-xs btn-circle hover:text-primary transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-base-content/20">—</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-base-content/40">
                <p className="text-sm">No entries match your search.</p>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;