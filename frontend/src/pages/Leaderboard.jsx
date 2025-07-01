import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sortData, getSortIcon } from "../utils/sorting";
import { leaderboardService } from "../utils/leaderboardService";
import { useAuth } from "../utils/AuthContext";
import Footer from "../components/Footer";
import LeaderboardSubmission from "../components/LeaderboardSubmission";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [taskLeaderboard, setTaskLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch all available tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tasks');
        const data = await response.json();
        if (data.status === 'success' && data.data.tasks.length > 0) {
          setAvailableTasks(data.data.tasks);
          // Set the first task as selected by default
          setSelectedTaskId(data.data.tasks[0]._id);
          setSelectedTask(data.data.tasks[0]);
        } else {
          setError("No tasks available.");
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again later.");
      }
    };

    fetchTasks();
  }, []);

  // Fetch leaderboard data when selected task changes
  useEffect(() => {
    if (!selectedTaskId) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await leaderboardService.getTaskLeaderboard(selectedTaskId);
        if (data.status === 'success') {
          setTaskLeaderboard(data.data.entries);
          // Find and set the selected task object
          const taskObj = availableTasks.find(t => t._id === selectedTaskId);
          if (taskObj) {
            setSelectedTask(taskObj);
          }
        } else {
          setError("Failed to fetch leaderboard data.");
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to fetch leaderboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTaskId, availableTasks]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleTaskChange = (e) => {
    const taskId = e.target.value;
    setSelectedTaskId(taskId);
    setSortConfig({ key: null, direction: "asc" });
    setShowSubmissionForm(false);
  };

  const handleSort = (key) => {
    const { sortedData, newSort } = sortData(taskLeaderboard, key, sortConfig);
    setTaskLeaderboard(sortedData);
    setSortConfig(newSort);
  };

  const handleSubmissionToggle = () => {
    if (!isAuthenticated) {
      setNotification({
        type: 'warning',
        message: 'Please log in to submit an entry'
      });
      return;
    }
    setShowSubmissionForm(!showSubmissionForm);
  };

  const handleSubmissionSuccess = (newEntry) => {
    setTaskLeaderboard(prev => [newEntry, ...prev]);
    setShowSubmissionForm(false);
    setNotification({
      type: 'success',
      message: 'Your entry was submitted successfully!'
    });
  };

  const formatMetricValue = (value) => {
    if (typeof value === 'number') {
      return parseFloat(value).toFixed(4);
    }
    return value || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading && !availableTasks.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

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
        {/* Error message */}
        {error && (
          <div className="bg-error/10 border border-error/30 text-error px-3 py-2 rounded mb-6">
            {error}
          </div>
        )}

        {/* Notification */}
        {notification.message && (
          <div className={`${notification.type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : notification.type === 'warning'
              ? 'bg-warning/10 border-warning/30 text-warning'
              : 'bg-info/10 border-info/30 text-info'
            } border px-3 py-2 rounded mb-6`}>
            {notification.message}
          </div>
        )}

        {/* Task Selection Dropdown */}
        {availableTasks.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 bg-base-200 p-4 rounded-xl">
            <div className="text-lg font-medium">Select Task:</div>
            <select
              className="select select-bordered w-full sm:w-auto max-w-md"
              value={selectedTaskId || ''}
              onChange={handleTaskChange}
            >
              {availableTasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Task Info Card */}
        {selectedTask && (
          <div className="card bg-base-100 shadow-xl mb-8 border border-base-300">
            <div className="card-body">
              <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
                <div className="w-full lg:w-[100%]">
                  <h2 className="text-2xl font-bold mb-2 text-primary">
                    {selectedTask.title}
                  </h2>
                  <p className="mb-4 opacity-90 line-clamp-3">
                    {selectedTask.long_description}
                  </p>
                </div>

                <div className="w-full lg:w-[200px] flex flex-wrap gap-2 justify-start lg:justify-end">
                  <button
                    onClick={() => navigate(`/tasks`)}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    <span>📋</span> View Task Details
                  </button>
                  <button
                    onClick={handleSubmissionToggle}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    {showSubmissionForm ? "Cancel" : "Submit Results"}
                  </button>
                </div>
              </div>

              {/* Show submission form if requested */}
              {showSubmissionForm && (
                <LeaderboardSubmission
                  taskId={selectedTaskId}
                  taskMetrics={selectedTask.metrics}
                  onSubmissionSuccess={handleSubmissionSuccess}
                />
              )}

              {!showSubmissionForm && (
                <>
                  <div className="divider">Evaluation Metrics</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTask.metrics.map((metric) => (
                      <div key={metric.name} className="bg-base-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <h3 className="font-bold text-base mb-1">{metric.name}</h3>
                        <p className="text-sm opacity-90">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {selectedTask && taskLeaderboard && !showSubmissionForm && (
          <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
            <div className="card-body p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              ) : taskLeaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-lg mb-4">No entries yet for this task.</p>
                  <button
                    onClick={handleSubmissionToggle}
                    className="btn btn-primary"
                  >
                    Be the First to Submit
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-base-200">
                      <tr>
                        <th className="sticky left-0 z-10 bg-base-200">#</th>
                        <th className="sticky left-10 z-10 bg-base-200">Model / Approach</th>
                        {selectedTask.metrics.map(metric => (
                          <th
                            key={metric.name}
                            className="cursor-pointer hover:bg-base-300 text-xs whitespace-nowrap"
                            onClick={() => handleSort(`metrics.${metric.name}`)}
                          >
                            <div className="flex items-center gap-1">
                              {metric.name}
                              <span className="text-xs opacity-80">{getSortIcon(`metrics.${metric.name}`, sortConfig)}</span>
                            </div>
                          </th>
                        ))}
                        <th
                          className="cursor-pointer hover:bg-base-300 whitespace-nowrap"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            <span className="text-xs opacity-80">{getSortIcon("createdAt", sortConfig)}</span>
                          </div>
                        </th>
                        <th>Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskLeaderboard.map((entry, index) => (
                        <tr
                          key={entry._id}
                          className="hover:bg-base-200 transition-colors duration-200"
                        >
                          <td className="font-mono font-bold text-center">{index + 1}</td>
                          <td className="font-medium whitespace-nowrap sticky left-0 z-10 bg-base-100 hover:bg-base-200">
                            <div className="tooltip" data-tip={entry.description || "No description provided"}>
                              {entry.model}
                            </div>
                          </td>
                          {selectedTask.metrics.map(metric => {
                            const metricObj = entry.metrics.find(m => m.name === metric.name);
                            return (
                              <td key={metric.name} className="text-right">
                                <div className="badge badge-ghost font-mono">
                                  {metricObj ? formatMetricValue(metricObj.value) : 'N/A'}
                                </div>
                              </td>
                            );
                          })}
                          <td className="whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                          <td>
                            {entry.proof_link ? (
                              <a
                                href={entry.proof_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-outline"
                              >
                                🔗 Proof
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
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Leaderboard;