import React from "react";
import { Search, X } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

const TopBar = ({ title, subtitle, searchValue, onSearchChange, searchPlaceholder, children }) => {
    return (
        <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur-xl border-b border-base-300/50">
            <div className="flex items-center justify-between min-h-[4rem] px-4 sm:px-6 lg:px-8 py-3">
                {/* Left: Title */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg font-bold truncate leading-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-[10px] sm:text-xs text-base-content/50 truncate hidden sm:block">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Center/Right: Search + actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {onSearchChange !== undefined && (
                        <div className="relative hidden sm:block">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30"
                            />
                            <input
                                type="text"
                                value={searchValue || ""}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={searchPlaceholder || "Search..."}
                                className="input input-sm input-bordered pl-9 pr-8 w-48 lg:w-64 bg-base-200/50 focus:bg-base-100 transition-colors rounded-xl"
                            />
                            {searchValue && (
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="hidden sm:flex items-center gap-2">
                        {children}
                    </div>
                    <div className="lg:hidden">
                        <ThemeSelector />
                    </div>
                </div>
            </div>

            {/* Mobile search */}
            {onSearchChange !== undefined && (
                <div className="sm:hidden px-4 pb-3">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30"
                        />
                        <input
                            type="text"
                            value={searchValue || ""}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder || "Search..."}
                            className="input input-sm input-bordered pl-9 pr-8 w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded-xl"
                        />
                        {searchValue && (
                            <button
                                onClick={() => onSearchChange("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default TopBar;
