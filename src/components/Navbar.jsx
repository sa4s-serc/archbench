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
      <div className="navbar-start lg:flex-1">
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {!isHome && (
              <>
                <li>
                  <button onClick={() => navigate('/leaderboard')}>Leaderboard</button>
                </li>
                <li>
                  <button onClick={() => navigate('/tasks')}>Tasks</button>
                </li>
                <li>
                  <button onClick={() => navigate('/papers')}>Papers</button>
                </li>
              </>
            )}
            <li>
              <button onClick={() => navigate('/about')}>About</button>
            </li>
          </ul>
        </div>
        <div className="hidden lg:flex lg:flex-row gap-2">
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
              <button 
                className={`btn btn-sm btn-ghost ${isActive('/papers') 
                  ? 'text-primary border-b-2 border-primary' 
                  : ''}`}
                onClick={() => navigate('/papers')}
              >
                Papers
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
          ArchBench
        </button>
      </div>
      
      <div className="navbar-end lg:flex-1">
        <button 
          className={`hidden lg:inline-flex btn btn-sm btn-ghost ${isActive('/about') 
            ? 'text-primary border-b-2 border-primary' 
            : ''} mr-2`}
          onClick={() => navigate('/about')}
        >
          About
        </button>
        <div className="px-2">
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
};

export default Navbar;