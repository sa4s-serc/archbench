import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeSelector from "./ThemeSelector";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-md border-b border-base-300">
      <div className="navbar-start">
        <div className="flex flex-row gap-2">
          {!isHome && (
            <>
              <button 
                className={`btn btn-sm btn-ghost ${isActive('/leaderboard') 
                  ? 'text-primary border-b-2 border-primary' 
                  : ''}`}
                onClick={() => navigate('/leaderboard')}
              >
                Leaderboard
              </button>
              <button 
                className={`btn btn-sm btn-ghost ${isActive('/tasks') 
                  ? 'text-primary border-b-2 border-primary' 
                  : ''}`}
                onClick={() => navigate('/tasks')}
              >
                Tasks
              </button>
            </>
          )}
        </div>
      </div>
      <div className="navbar-center">
        <button 
          className={`btn btn-ghost text-xl normal-case ${isActive('/') 
            ? 'font-bold text-primary' 
            : ''}`}
          onClick={() => navigate('/')}
        >
          Archbench
        </button>
      </div>
      <div className="navbar-end">
        <button 
          className={`btn btn-sm btn-ghost ${isActive('/about') 
            ? 'text-primary border-b-2 border-primary' 
            : ''} mr-2`}
          onClick={() => navigate('/about')}
        >
          About
        </button>
        <ThemeSelector />
      </div>
    </div>
  );
};

export default Navbar;