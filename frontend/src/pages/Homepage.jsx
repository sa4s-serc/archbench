import React, { useState, useEffect } from "react";
import Introduction from "../components/Introduction";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChartLine, faUsers, faTasks, faMedal, faEnvelope } from "@fortawesome/free-solid-svg-icons";
// Keep existing JSON imports for fallback
import adrGeneration from "../data/adrGenData.json";
import dynamicData from "../data/dynamicGenData.json";
import serverlessData from "../data/serverlessData.json";

const Homepage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    entries: 0,
    latestSubmission: null,
    categories: 0,
  });
  const [error, setError] = useState(null);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch tasks
        const tasksResponse = await fetch('http://localhost:5000/api/tasks');
        const tasksData = await tasksResponse.json();

        // Fetch leaderboard entries
        const entriesResponse = await fetch('http://localhost:5000/api/leaderboard');
        const entriesData = await entriesResponse.json();

        // Fetch users (this might require admin access)
        let usersCount = 0;
        try {
          const usersResponse = await fetch('http://localhost:5000/api/users', {
            credentials: 'include'
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            usersCount = usersData.data?.users?.length || 0;
          }
        } catch (e) {
          console.log("Could not fetch user count, likely not admin");
        }

        // Calculate latest submission date
        let latestSubmission = null;
        if (entriesData.status === 'success' && entriesData.data.entries.length > 0) {
          const dates = entriesData.data.entries.map(entry => new Date(entry.createdAt).getTime());
          latestSubmission = new Date(Math.max(...dates));
        } else {
          // Fallback to JSON data
          latestSubmission = new Date(
            Math.max(
              ...adrGeneration.entries.map((e) => new Date(e.date).getTime()),
              ...serverlessData.entries.map((e) => new Date(e.date).getTime()),
              ...dynamicData.entries.map((e) => new Date(e.date).getTime())
            )
          );
        }

        // Count unique task categories
        const uniqueCategories = tasksData.status === 'success'
          ? new Set(tasksData.data.tasks.map(task => task.category || 'Uncategorized')).size
          : 3; // Default to 3 categories (ADR, Serverless, Dynamic)

        // Set the stats
        setStats({
          users: usersCount,
          tasks: tasksData.status === 'success' ? tasksData.data.tasks.length : 0,
          entries: entriesData.status === 'success' ? entriesData.data.entries.length : 0,
          latestSubmission,
          categories: uniqueCategories,
        });

      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to fetch platform statistics");

        // Fallback to JSON file data
        const fallbackEntries = [
          ...adrGeneration.entries,
          ...dynamicData.entries,
          ...serverlessData.entries
        ];

        setStats({
          users: 0,
          tasks: 3,
          entries: fallbackEntries.length,
          latestSubmission: new Date(
            Math.max(
              ...fallbackEntries.map((e) => new Date(e.date).getTime())
            )
          ),
          categories: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const openSubmitModal = () => {
    document.getElementById("submit_modal").showModal();
  };

  const closeModal = (e) => {
    const modal = document.getElementById("submit_modal");
    if (e.target === modal) {
      modal.close();
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Introduction />

      {/* Categories Preview */}
      <section className="py-12 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Benchmark Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary">ADR Generation</h3>
                <p className="mb-4 line-clamp-3">
                  {adrGeneration.short_description}
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate("/tasks")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary">Serverless Components</h3>
                <p className="mb-4 line-clamp-3">
                  {serverlessData.short_description}
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate("/tasks")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary">Dynamic Services</h3>
                <p className="mb-4 line-clamp-3">
                  {dynamicData.short_description}
                </p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => navigate("/tasks")}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Platform Statistics
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error shadow-lg mb-6">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                  <div className="card-body text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      {stats.entries}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1">
                      <FontAwesomeIcon icon={faMedal} className="mr-2" />
                      Total Submissions
                    </h3>
                    <p className="text-xs md:text-sm opacity-75">Across all categories</p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                  <div className="card-body text-center">
                    <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                      {formatDate(stats.latestSubmission)}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1">
                      Latest Submission
                    </h3>
                    <p className="text-xs md:text-sm opacity-75">
                      Most recent benchmark update
                    </p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                  <div className="card-body text-center">
                    <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                      {stats.categories}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1">
                      <FontAwesomeIcon icon={faTasks} className="mr-2" />
                      Categories
                    </h3>
                    <p className="text-xs md:text-sm opacity-75">
                      Benchmark categories available
                    </p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
                  <div className="card-body text-center">
                    <div className="text-3xl md:text-4xl font-bold text-info mb-2">
                      {stats.tasks}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1">
                      <FontAwesomeIcon icon={faTasks} className="mr-2" />
                      Tasks
                    </h3>
                    <p className="text-xs md:text-sm opacity-75">
                      Available benchmark tasks
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Submissions Preview */}
              <div className="text-center">
                <button
                  className="btn btn-primary btn-md"
                  onClick={() => navigate('/leaderboard')}
                >
                  View Leaderboard
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />

      {/* Submission Modal */}
      <dialog id="submit_modal" className="modal" onClick={closeModal}>
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Submission Instructions</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </form>
          </div>
          <div className="prose max-w-none">
            <h3>How to Submit Your Results</h3>
            <p>
              To make a submission to our benchmark, please contact us via email
              at:
            </p>
            <div className="bg-base-200 p-4 my-4 rounded-lg text-center">
              <span className="font-semibold text-lg">
                bassam.adnan@research.iiit.ac.in
              </span>
            </div>
            <p>
              Please include the following information in your submission email:
            </p>
            <ul>
              <li>
                Task category (ADR, Serverless, or Dynamic Service Generation)
              </li>
              <li>Team or organization name</li>
              <li>Brief description of your approach</li>
              <li>Performance metrics</li>
              <li>Link to your implementation (if publicly available)</li>
            </ul>
            <p>
              We review all submissions and will contact
              you if we need any additional information.
            </p>
            <div className="mt-6 bg-base-200 p-4 rounded-lg">
              <p className="font-semibold">Important Note:</p>
              <p className="text-sm mt-2">
                All submissions will be properly cited on our website. Please
                ensure your submission is original work and does not contain
                plagiarized material.
              </p>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Homepage;
