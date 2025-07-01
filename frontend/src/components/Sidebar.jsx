import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import ThemeSelector from "./ThemeSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartBar,
    faTasks,
    faNewspaper,
    faInfoCircle,
    faSignInAlt,
    faUserPlus,
    faSignOutAlt,
    faHome,
    faGlobe,
    faUserShield
} from "@fortawesome/free-solid-svg-icons";
import {
    faGithub,
    faTwitter,
    faLinkedin
} from "@fortawesome/free-brands-svg-icons";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/');
        closeSidebar();
    };

    const menuItems = [
        { path: '/', label: 'Home', icon: faHome },
        { path: '/about', label: 'About', icon: faInfoCircle },
        { path: '/tasks', label: 'Tasks', icon: faTasks },
        { path: '/leaderboard', label: 'Leaderboard', icon: faChartBar },
        { path: '/papers', label: 'Papers', icon: faNewspaper },
    ];

    // Add Admin option only for users with authLevel 0
    if (user && user.authLevel === 0) {
        menuItems.push({ path: '/admin', label: 'Admin Panel', icon: faUserShield });
    }

    // Helper function to close sidebar on mobile
    const closeSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile-visible');
        }
    };

    // Handle navigation & close sidebar on mobile
    const handleNavigate = (path) => {
        navigate(path);
        closeSidebar();
    };

    return (
        <aside className="sidebar bg-base-200 shadow-lg flex flex-col h-screen z-30">
            {/* Title with logo at top */}
            <div className="p-4 border-b border-base-300">
                <button
                    className={`btn btn-ghost text-xl normal-case w-full flex items-center gap-2 justify-center ${isActive('/') ? 'font-bold text-primary' : ''}`}
                    onClick={() => handleNavigate('/')}
                >
                    <img src="/icon.png" alt="ArchBench Logo" className="w-8 h-8" />
                    ArchBench
                </button>
            </div>

            {/* Scrollable menu items */}
            <div className="flex-1 overflow-y-auto">
                <ul className="menu menu-md gap-2">
                    {menuItems.map(item => (
                        <li key={item.path}>
                            <button
                                className={`flex items-center text-lg gap-3 hover:bg-base-300 ${isActive(item.path)
                                    ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary'
                                    : ''
                                    }`}
                                onClick={() => handleNavigate(item.path)}
                            >
                                <FontAwesomeIcon icon={item.icon} />
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Authentication buttons at bottom */}
            <div className="border-t border-base-300 p-4 flex flex-col gap-3">
                {!user ? (
                    <div className="flex flex-col gap-2">
                        <button
                            className={`btn btn-sm w-full flex items-center justify-center gap-2 ${isActive('/login') ? 'btn-primary' : 'btn-outline btn-primary'}`}
                            onClick={() => handleNavigate('/login')}
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                            Login
                        </button>
                        <button
                            className={`btn btn-sm w-full flex items-center justify-center gap-2 ${isActive('/register') ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
                            onClick={() => handleNavigate('/register')}
                        >
                            <FontAwesomeIcon icon={faUserPlus} />
                            Register
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Hi, {user.username || user.name}</span>
                        <button
                            className="btn btn-sm btn-outline btn-error w-full flex items-center justify-center gap-2"
                            onClick={handleLogout}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Theme selector - visible on both mobile and desktop */}
            <div className="border-t border-base-300 p-2">
                <div className="flex justify-center items-center">
                    <div className="bg-base-200 shadow-inner p-3 rounded-xl hover:bg-base-300 transition-all duration-300">
                        <ThemeSelector />
                    </div>
                </div>
            </div>

            {/* Social media links */}
            <div className="border-t border-base-300 p-4">
                <h3 className="text-sm font-medium mb-2 text-center">Connect with us</h3>
                <div className="flex justify-center space-x-4">
                    <a href="https://sa4s-serc.github.io/" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-ghost hover:bg-transparent btn-sm group">
                        <FontAwesomeIcon icon={faGlobe} size="lg" className="transition-colors duration-300 group-hover:text-primary" />
                    </a>
                    <a href="https://github.com/sa4s-serc" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-ghost hover:bg-transparent btn-sm group">
                        <FontAwesomeIcon icon={faGithub} size="lg" className="transition-colors duration-300 group-hover:text-[#f34f29]" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-ghost hover:bg-transparent btn-sm group">
                        <FontAwesomeIcon icon={faTwitter} size="lg" className="transition-colors duration-300 group-hover:text-[#1DA1F2]" />
                    </a>
                    <a href="https://in.linkedin.com/company/serciiith" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-ghost hover:bg-transparent btn-sm group">
                        <FontAwesomeIcon icon={faLinkedin} size="lg" className="transition-colors duration-300 group-hover:text-[#0077B5]" />
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;