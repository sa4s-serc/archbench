import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faTimes,
  faCopy,
  faMagnifyingGlass,
  faDownload,
  faSpinner,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const taskRefs = useRef([]);
  const [markdownContent, setMarkdownContent] = useState("");
  const [modalTitle, setModalTitle] = useState("Example");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = 'http://localhost:5000/api';

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/tasks`);

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data.data.tasks);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => {
    if (!searchTerm) return true;

    const searchTermLower = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchTermLower) ||
      task.long_description.toLowerCase().includes(searchTermLower)
    );
  });

  const scrollToTask = (index) => {
    taskRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openModal = async (task) => {
    try {
      // Use the task example content from the database if available
      if (task.example) {
        setMarkdownContent(task.example);
        setModalTitle(`${task.title} Example`);
        setTimeout(() => {
          document.getElementById("example_modal").showModal();
        }, 100);
        return;
      }

      // Fallback to a default example file
      const response = await fetch("adrExample.md");
      const text = await response.text();
      setMarkdownContent(text);
      setModalTitle(`${task.title} Example`);
      setTimeout(() => {
        document.getElementById("example_modal").showModal();
      }, 100);
    } catch (error) {
      console.error("Error loading example:", error);
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
          <div className="flex flex-col items-center gap-4">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-primary" />
            <p className="font-medium text-lg">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="card bg-base-100 p-8 shadow-xl border border-base-200">
          <div className="flex flex-col items-center gap-4">
            <div className="text-error text-4xl">⚠️</div>
            <p className="font-medium text-lg text-error">{error}</p>
            <button
              className="btn btn-outline btn-error"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <section className="py-12 px-4 bg-base-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-base-100 p-6 rounded-2xl shadow-xl border border-base-300">
              <div className="md:w-1/3 flex justify-center">
                <img
                  src="/sa4s_logo_final.svg"
                  alt="SA4S Logo"
                  className="w-64 max-w-full h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Task Descriptions
                </h1>
                <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                  <p className="text-lg">There are currently no tasks defined in the system.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <section className="w-full py-12 px-4 bg-base-200 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-base-100 p-6 rounded-2xl shadow-xl border border-base-300">
            <div className="md:w-1/3 flex justify-center">
              <img
                src="/sa4s_logo_final.svg"
                alt="SA4S Logo"
                className="w-64 max-w-full h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Task Descriptions
              </h1>
              <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                <p className="text-lg">Explore our research tasks and contribute to advancing software architecture knowledge through these structured challenges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <div className="w-full mb-8 max-w-3xl">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex gap-4">
              <div className="form-control flex-1">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="input input-primary w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-primary">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredTasks.map((task, index) => (
        <section
          key={index}
          ref={(el) => (taskRefs.current[index] = el)}
          id={`task-${index}`}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h2 className="card-title text-3xl font-bold text-primary mb-2">
                    {task.title}
                  </h2>
                </div>
              </div>

              <div className="prose text-lg max-w-none mb-6">
                <p>{task.long_description}</p>
              </div>

              {/* Evaluation metrics section */}
              {task.metrics && task.metrics.length > 0 && (
                <>
                  <div className="divider">
                    <h3 className="text-lg font-semibold">Evaluation Metrics</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {task.metrics.map((metric, idx) => (
                      <div key={idx} className="card bg-base-200 shadow-sm transition-all duration-300">
                        <div className="card-body p-4">
                          <h4 className="card-title text-base">{metric.name}</h4>
                          <p className="text-sm">{metric.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="divider">
                <h3 className="text-lg font-semibold">Task Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="card bg-base-200 shadow-sm border border-base-300">
                  <div className="card-body p-4">
                    <h4 className="card-title text-base">Input Format</h4>
                    <p className="text-sm">{task.input_format || "Not specified"}</p>
                  </div>
                </div>
                <div className="card bg-base-200 shadow-sm border border-base-300">
                  <div className="card-body p-4">
                    <h4 className="card-title text-base">Output Format</h4>
                    <p className="text-sm">{task.output_format || "Not specified"}</p>
                  </div>
                </div>

                {/* Custom fields moved here to be under Task Details */}
                {task.custom_fields && task.custom_fields.map((field, idx) => (
                  <div key={idx} className="card bg-base-200 shadow-sm transition-all duration-300 border border-base-300">
                    <div className="card-body p-4">
                      <h4 className="card-title text-base">{field.name}</h4>
                      <p className="text-sm">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                {/* Example button */}
                <button
                  onClick={() => openModal(task)}
                  className="btn btn-outline btn-primary"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" /> View Example
                </button>

                {/* Dataset URL button */}
                {task.dataset_url && (
                  <a
                    href={task.dataset_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download Dataset
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      <Footer />

      {/* Example Modal */}
      <dialog id="example_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{modalTitle}</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="btn btn-sm btn-outline"
              >
                <FontAwesomeIcon icon={faCopy} className="mr-2" /> Copy
              </button>
              <form method="dialog">
                <button className="btn btn-sm btn-circle">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </form>
            </div>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none bg-base-200 p-6 rounded-xl overflow-auto max-h-[70vh]">
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
    </div>
  );
};

export default Tasks;