import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Toggle sidebar visibility for mobile view
  const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      const isCurrentlyOpen = sidebar.classList.contains('mobile-visible');
      setIsSidebarOpen(!isCurrentlyOpen);

      if (isCurrentlyOpen) {
        sidebar.classList.remove('mobile-visible');
      } else {
        sidebar.classList.add('mobile-visible');
      }
    }
  };

  // Close sidebar when changing routes
  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.remove('mobile-visible');
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="navbar bg-base-100 shadow-md border-b border-base-300 sticky top-0 z-40 lg:hidden">
      {/* Title on the left */}
      <div className="navbar-start">
        <button
          className={`btn btn-ghost text-xl normal-case ${isActive('/') ? 'font-bold text-primary' : ''}`}
          onClick={() => navigate('/')}
        >
          <img src="/icon.png" alt="ArchBench Logo" className="w-6 h-6 mr-2 hidden sm:inline-block" />
          ArchBench
        </button>
      </div>

      {/* Empty middle section */}
      <div className="navbar-center"></div>

      {/* Toggle button on the right */}
      <div className="navbar-end">
        <button
          className="btn btn-ghost btn-circle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <FontAwesomeIcon icon={isSidebarOpen ? faXmark : faBars} className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;