import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../lib/theme";

const PRIMARY = [
  { to: "/", label: "Overview", end: true },
  { to: "/tasks", label: "Tasks" },
  { to: "/models", label: "Models" },
  { to: "/guidelines", label: "Guidelines" },
  { to: "/papers", label: "Papers" },
];

const SECONDARY = [
  { to: "/about", label: "About" },
  { to: "/contribute", label: "Contribute" },
];

function ThemeButton() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

const desktopLink = ({ isActive }) =>
  `relative flex h-14 items-center text-sm transition-colors duration-150 ${
    isActive
      ? "font-medium text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent"
      : "text-ink-2 hover:text-ink"
  }`;

const mobileLink = ({ isActive }) =>
  `flex min-h-[48px] items-center border-t border-line text-base ${isActive ? "font-medium text-ink" : "text-ink-2"}`;

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-sticky border-b border-line bg-page">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-content items-center gap-8 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-[-0.01em] text-ink">
          <img src="/sa4s_logo_final.svg" alt="" className="h-6 w-6" />
          ArchBench
        </Link>
        <div className="hidden flex-1 items-center gap-6 md:flex">
          {PRIMARY.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLink}>
              {item.label}
            </NavLink>
          ))}
          <div className="ml-auto flex items-center gap-6">
            {SECONDARY.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopLink}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeButton />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 hover:text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-page px-4 pb-4 md:hidden">
          {[...PRIMARY, ...SECONDARY].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={mobileLink}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
