import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";
import traceabilityData from "../data/traceabilityData.json";
import microserviceData from "../data/microserviceData.json";
import TopBar from "../components/TopBar";
import {
  Layers,
  GitBranch,
  Sparkles,
  BarChart3,
  Boxes,
  Download,
  Eye,
  ChevronRight,
  Medal,
} from "lucide-react";

const taskMeta = [
  { key: "adr", icon: Layers, color: "from-blue-500 to-cyan-400", data: adrGeneration },
  { key: "serverless", icon: GitBranch, color: "from-purple-500 to-pink-400", data: serverlessData },
  { key: "dynamic", icon: Sparkles, color: "from-orange-500 to-yellow-400", data: dynamicData },
  { key: "traceability", icon: BarChart3, color: "from-green-500 to-emerald-400", data: traceabilityData },
  { key: "microservice", icon: Boxes, color: "from-red-500 to-rose-400", data: microserviceData },
];

const Tasks = () => {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [modalTitle, setModalTitle] = useState("Example");

  // Filter task categories by search
  const filteredTasks = taskMeta.filter((meta) =>
    meta.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meta.data.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search has no results
  const hasNoResults = searchQuery && filteredTasks.length === 0;

  // Use selected index, or fall back to first filtered result when searching
  const displayIdx = searchQuery
    ? (filteredTasks.length > 0 ? taskMeta.indexOf(filteredTasks[0]) : selectedIdx)
    : selectedIdx;
  const task = taskMeta[displayIdx].data;

  // Show all metrics and details for the selected task (not filtered by search)
  const filteredMetrics = task.metrics;

  const getExampleFileName = (taskType) => {
    switch (taskType) {
      case "adr": return "adrExample.md";
      case "serverless": return "serverlessExample.md";
      case "dynamic": return "dynamicExample.md";
      case "traceability": return "traceabilityExample.md";
      case "microservice": return "microserviceExample.md";
      default: return null;
    }
  };

  const getModalTitle = (taskType) => {
    switch (taskType) {
      case "adr": return "Example ADR Document";
      case "serverless": return "Example Serverless Function";
      case "dynamic": return "Example IoT Service";
      case "traceability": return "Example Traceability Task";
      case "microservice": return "Example Microservice Generation Task";
      default: return "Example";
    }
  };

  const openModal = async (task) => {
    const fileName = getExampleFileName(task.type);
    if (!fileName) return;
    try {
      const response = await fetch(fileName);
      const text = await response.text();
      setMarkdownContent(text);
      setModalTitle(getModalTitle(task.type));
      setTimeout(() => {
        document.getElementById("example_modal").showModal();
      }, 100);
    } catch (error) {
      console.error("Error reading markdown file:", error);
    }
  };

  const closeModal = (e) => {
    const modal = document.getElementById("example_modal");
    if (e.target === modal) modal.close();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const renderTaskDetails = (task) => {
    const detailsMap = {
      adr: [
        { label: "Input Format", value: "Architecture documentation in markdown format" },
        { label: "Output Format", value: "Generated ADRs in markdown format" },
        { label: "Dataset Size", value: `${task.dataset_size || "1000"} architecture documents` },
        { label: "Time Limit", value: `${task.time_limit || "2 hours"} per submission` },
      ],
      serverless: [
        { label: "Input Format", value: "Function specifications and requirements" },
        { label: "Output Format", value: "Serverless function implementation" },
        { label: "Test Cases", value: task.test_cases?.description || "Automated test suite for functionality verification" },
        { label: "Intervention", value: task.intervention_details || "Human review and modification of generated code" },
      ],
      dynamic: [
        { label: "Input Format", value: "Query specification defining service requirements" },
        { label: "Output Format", value: "Generated IoT service implementation" },
        { label: "Baseline Comparison", value: "Reference implementation provided for comparison" },
        { label: "Evaluation Method", value: "CodeBERTScore metrics (Precision, Recall, F1, F3)" },
      ],
      traceability: [
        { label: "Input Format", value: "Architecture documentation (SAD), Architecture models (SAMs), Source code (ACM)" },
        { label: "Output Format", value: "CSV files with trace links (sentence-component or sentence-code pairs)" },
        { label: "Task Types", value: `${task.task_types ? task.task_types.length : 4} different traceability scenarios covered` },
        { label: "Dataset", value: task.dataset_info ? `${task.dataset_info.projects.length} projects (${task.dataset_info.projects.join(", ")})` : "ArDoCo benchmark with 5 open-source projects" },
      ],
      microservice: [
        { label: "Input Format", value: "Requirements specifications + existing codebase context (incremental) or requirements only (clean state)" },
        { label: "Output Format", value: "Complete microservice implementation (Java/Python) with all components" },
        { label: "Generation Scenarios", value: "Incremental (with codebase context) and Clean State (from requirements only)" },
        { label: "Dataset", value: "5 microservice projects (PiggyMetrics, Train-Ticket, TeamSync, Project-Management, MicroBank)" },
      ],
    };
    return detailsMap[task.type] || [];
  };

  return (
    <>
      <TopBar
        title="Tasks"
        subtitle="Explore benchmark task categories and details"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tasks by name..."
      >
        <button
          onClick={() => navigate("/leaderboard")}
          className="btn btn-sm btn-ghost rounded-xl gap-1.5 hidden sm:inline-flex"
        >
          <Medal size={14} />
          View Leaderboard
        </button>
      </TopBar>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left category panel */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-base-300/50 bg-base-200/30 p-4 gap-2">
          <p className="text-xs text-base-content/40 uppercase tracking-wider font-medium px-3 mb-2">
            Categories
          </p>
          {filteredTasks.map((meta) => {
            const Icon = meta.icon;
            const active = meta.key === taskMeta[displayIdx].key;
            return (
              <div key={meta.key} className="tooltip tooltip-right w-full" data-tip={meta.data.title}>
                <button
                  onClick={() => {
                    setSelectedIdx(taskMeta.indexOf(meta));
                    setSearchQuery("");
                  }}
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
                  <span className="text-sm truncate">{meta.data.title}</span>
                  {active && <ChevronRight size={14} className="ml-auto text-primary/50" />}
                </button>
              </div>
            );
          })}
        </aside>

        {/* Mobile category selector */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-base-200/90 backdrop-blur-xl border-t border-base-300/50 px-2 py-2 flex gap-1 overflow-x-auto">
          {filteredTasks.map((meta) => {
            const Icon = meta.icon;
            const active = meta.key === taskMeta[displayIdx].key;
            return (
              <div key={meta.key} className="tooltip tooltip-top" data-tip={meta.data.title}>
                <button
                  onClick={() => {
                    setSelectedIdx(taskMeta.indexOf(meta));
                    setSearchQuery("");
                  }}
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
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {hasNoResults ? (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-8rem)]">
              <div className="text-center">
                <p className="text-xl font-semibold text-base-content/60 mb-2">No tasks found</p>
                <p className="text-sm text-base-content/40 mb-6">
                  No tasks match "{searchQuery}". Try a different search term.
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
          {/* Task header card */}
          <div className="rounded-2xl bg-base-200/50 border border-base-300/50 p-6 sm:p-8 mb-8">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    {task.title}
                  </h2>
                  <p className="text-base-content/60 leading-relaxed max-w-2xl">
                    {task.long_description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {task.example_available && (
                  <button
                    onClick={() => openModal(task)}
                    className="btn btn-sm btn-outline rounded-xl gap-2"
                  >
                    <Eye size={14} />
                    View Example
                  </button>
                )}
                {task.dataset_download && (
                  <a
                    href={task.dataset_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary rounded-xl gap-2"
                  >
                    <Download size={14} />
                    Download Dataset
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-base-content/40 uppercase tracking-wider mb-4">
              Evaluation Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-base-200/50 border border-base-300/30 hover:border-primary/20 transition-colors"
                >
                  <h4 className="font-bold text-sm mb-1">{metric.name}</h4>
                  <p className="text-xs text-base-content/50 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div>
            <h3 className="text-sm font-semibold text-base-content/40 uppercase tracking-wider mb-4">
              Task Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderTaskDetails(task).map((detail, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-base-200/50 border border-base-300/30"
                >
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {detail.label}
                  </span>
                  <p className="mt-1 text-sm text-base-content/70">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Example Modal */}
      <dialog id="example_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-5xl rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{modalTitle}</h3>
            <button
              onClick={copyToClipboard}
              className="btn btn-sm btn-outline rounded-xl"
            >
              📋 Copy
            </button>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={dracula}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Tasks;