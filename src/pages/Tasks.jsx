import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import adrGeneration from "../data/adrGenData.json";
import serverlessData from "../data/serverlessData.json";
import dynamicData from "../data/dynamicGenData.json";

const Tasks = () => {
  const tasks = [adrGeneration, serverlessData, dynamicData];
  const taskRefs = useRef([]);
  const [markdownContent, setMarkdownContent] = useState("");
  const [modalTitle, setModalTitle] = useState("Example");

  const scrollToTask = (index) => {
    taskRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const getExampleFileName = (taskType) => {
    switch (taskType) {
      case "adr":
        return "/examples/adr_example.md";
      case "serverless":
        return "/examples/serverless_example.md";
      case "dynamic":
        return "/examples/dynamic_example.md";
      default:
        return null;
    }
  };

  const getModalTitle = (taskType) => {
    switch (taskType) {
      case "adr":
        return "Example ADR Document";
      case "serverless":
        return "Example Serverless Function";
      case "dynamic":
        return "Example IoT Service";
      default:
        return "Example";
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
    if (e.target === modal) {
      modal.close();
    }
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
    switch (task.type) {
      case "adr":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Input Format:</span>
              <p className="mt-1 opacity-90">Architecture documentation in markdown format</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Output Format:</span>
              <p className="mt-1 opacity-90">Generated ADRs in markdown format</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Dataset Size:</span>
              <p className="mt-1 opacity-90">{task.dataset_size || "1000"} architecture documents</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Time Limit:</span>
              <p className="mt-1 opacity-90">{task.time_limit || "2 hours"} per submission</p>
            </div>
          </div>
        );

      case "serverless":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Input Format:</span>
              <p className="mt-1 opacity-90">Function specifications and requirements</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Output Format:</span>
              <p className="mt-1 opacity-90">Serverless function implementation</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Test Cases:</span>
              <p className="mt-1 opacity-90">
                {task.test_cases?.description || "Automated test suite for functionality verification"}
              </p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Intervention:</span>
              <p className="mt-1 opacity-90">
                {task.intervention_details || "Human review and modification of generated code"}
              </p>
            </div>
          </div>
        );

      case "dynamic":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Input Format:</span>
              <p className="mt-1 opacity-90">CQuery specification defining service requirements</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Output Format:</span>
              <p className="mt-1 opacity-90">Generated IoT service implementation</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Baseline Comparison:</span>
              <p className="mt-1 opacity-90">Reference implementation provided for comparison</p>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
              <span className="font-semibold">Evaluation Method:</span>
              <p className="mt-1 opacity-90">CodeBERTScore metrics (Precision, Recall, F1, F3)</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="opacity-90">Task details not available</p>
          </div>
        );
    }
  };

  return (
    <>
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

                {renderTaskDetails(task)}

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
                  {task.example_available && (
                    <button
                      onClick={() => openModal(task)}
                      className="btn btn-outline w-full sm:w-auto"
                    >
                      🔍 View Example
                    </button>
                  )}
                  {task.dataset_download && (
                    <a
                      href={task.dataset_link}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="btn btn-primary w-full sm:w-auto"
                    >
                      📥 Download Dataset
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <dialog id="example_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{modalTitle}</h3>
            <button
              onClick={copyToClipboard}
              className="btn btn-sm btn-outline"
            >
              📋 Copy
            </button>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown
              children={markdownContent}
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
            />
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Tasks;