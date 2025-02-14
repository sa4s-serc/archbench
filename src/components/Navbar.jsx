import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeSelector from "./ThemeSelector";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="navbar bg-base-100 shadow-md border-b border-base-300">
      <div className="navbar-start">
        <ul className="menu menu-horizontal px-1">
          {!isHome && (
            <>
              <li>
                <a onClick={() => navigate('/leaderboard')}>Leaderboard</a>
              </li>
              <li>
                <a onClick={() => navigate('/tasks')}>Tasks</a>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="navbar-center">
        <a 
          className="btn btn-ghost text-xl"
          onClick={() => navigate('/')}
        >
          Archbench
        </a>
      </div>
      <div className="navbar-end">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a onClick={() => navigate('/about')}>About</a>
          </li>
        </ul>
        <ThemeSelector />
      </div>
    </div>
  );
};

export default Navbar;