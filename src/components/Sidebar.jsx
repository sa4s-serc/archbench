import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Trophy,
    ClipboardList,
    BookOpen,
    Info,
    Home,
    ChevronLeft,
    ChevronRight,
    Send,
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";

const navItems = [
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/tasks", label: "Tasks", icon: ClipboardList },
    { path: "/papers", label: "Papers", icon: BookOpen },
    { path: "/about", label: "About", icon: Info },
    { path: "/contribute", label: "Contribute", icon: Send },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-base-200/80 backdrop-blur-xl border-r border-base-300/50 z-40 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-60"
                    }`}
            >
                {/* Brand */}
                <a href="/" className="flex items-center gap-3 px-4 h-16 border-b border-base-300/50">
                <div className="flex items-center gap-3 px-4 h-16 border-b border-base-300/50">
                    <img
                        src="/sa4s_logo_final.svg"
                        alt="SA4S"
                        className="h-8 w-8 shrink-0 object-contain"
                    />
                    {!collapsed && (
                        <span className="font-bold text-lg tracking-tight">
                            ArchBench
                        </span>
                    )}
                </div>
                </a>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                                    : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"
                                    }`}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon
                                    size={20}
                                    className={`shrink-0 transition-colors ${active ? "text-primary" : "group-hover:text-primary/70"
                                        }`}
                                />
                                {!collapsed && (
                                    <span className="text-sm truncate">{item.label}</span>
                                )}
                                {active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="px-3 py-4 border-t border-base-300/50 space-y-3">
                    <div className={`flex ${collapsed ? "justify-center" : "justify-between"} items-center px-2`}>
                        {!collapsed && (
                            <span className="text-xs text-base-content/40 uppercase tracking-wider">
                                Theme
                            </span>
                        )}
                        <ThemeSelector />
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-300/50 transition-all"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        {!collapsed && <span className="text-xs">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile bottom bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-200/90 backdrop-blur-xl border-t border-base-300/50 safe-area-bottom">
                <div className="flex items-center justify-around py-2 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active
                                    ? "text-primary"
                                    : "text-base-content/40 hover:text-base-content/70"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {active && (
                                    <div className="w-4 h-0.5 bg-primary rounded-full mt-0.5" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
