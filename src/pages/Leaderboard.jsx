import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";
import traceabilityData from "../data/traceabilityData.json";
import { sortData, getSortIcon } from "../utils/sorting";
import TopBar from "../components/TopBar";
import {
  Layers,
  GitBranch,
  Sparkles,
  BarChart3,
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
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
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
        { name: "Avg Cyclomatic (No Int.)", key: "cyclomatic_complexity" },
        { name: "Avg Cognitive (No Int.)", key: "cognitive_complexity" },
        { name: "Avg Halstead (No Int.)", key: "halstead_volume" },
        { name: "Avg CodeBLEU (No Int.)", key: "codebleu" },
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

  // Filter table entries by category search query (within the selected category)
  const filteredData = displayTableData.filter((entry) =>
    entry.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

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

          {/* Metric info */}
          {/* <div className="p-4 border-t border-base-300/50 mt-auto">
            <p className="text-xs text-base-content/40 uppercase tracking-wider font-medium px-3 mt-4 mb-3">
              Metrics
            </p>
            <div className="space-y-1.5 px-3 max-h-48 overflow-y-auto">
              {displayTask.data.metrics.map((metric) => (
                <div key={metric.name} className="group">
                  <p className="text-xs font-medium text-base-content/70">{metric.name}</p>
                  <p className="text-[10px] text-base-content/40 leading-snug">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div> */}
        </aside>

        {/* Mobile category selector */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-base-200/90 backdrop-blur-xl border-t border-base-300/50 px-2 py-2 flex gap-1 overflow-x-auto">
          {filteredByCategory.map((meta) => {
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
                  {meta.data.title.split(" ")[0]}
                </button>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
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
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
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

          {/* Table */}
          <div className="rounded-2xl border border-base-300/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
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