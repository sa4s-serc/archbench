import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardList, Compass, Cpu, FileText, Info, Menu, Search, Send, Trophy, X } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { ModelLogo } from "./ui";
import { useResults } from "../lib/ResultsContext";
import { rowsFor } from "../lib/results";
import { taskInfo } from "../data/taskInfo";
import { TASK_ICONS } from "../lib/taskIcons";

export const NAV = [
  { to: "/leaderboard", label: "Leaderboards", icon: Trophy, menu: "tasks" },
  { to: "/models", label: "Models", icon: Cpu, menu: "models" },
  { to: "/recommender", label: "Model Recommender", icon: Compass, highlight: true },
  { to: "/methodology", label: "Methodology", icon: ClipboardList },
  { to: "/papers", label: "Papers", icon: BookOpen },
  { to: "/about", label: "About", icon: Info },
  { to: "/contribute", label: "Contribute", icon: Send },
];

const PAPER = "https://arxiv.org/abs/2603.17833";

function TasksMenu({ doc }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="flex flex-col gap-1 border-base-300/60 lg:border-r lg:pr-6">
        <p className="px-3 pb-1 text-xs font-medium text-base-content/50">Leaderboards</p>
        <p className="px-3 text-sm leading-relaxed text-base-content/65">
          One leaderboard per task, ranking every model on the same data and the same scores.
        </p>
        <Link to="/methodology" className="mt-2 inline-flex items-center gap-1 px-3 text-sm font-medium text-primary hover:underline">
          How tasks are scored <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
        {Object.keys(doc.tasks).map((t) => {
          const Icon = TASK_ICONS[t];
          const count = new Set(rowsFor(doc, t).map((r) => r.model_id)).size;
          return (
            <li key={t}>
              <Link to={`/leaderboard/${t}`} className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-base-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{doc.tasks[t].name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-base-content/60">{taskInfo(t).summary}</span>
                  <span className="mt-1 block text-[11px] text-base-content/45">{count} models</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ModelsMenu({ doc }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const ids = [...new Set(doc.results.map((r) => r.model_id))];
    return ids
      .map((id) => ({ id, model: doc.models[id], name: doc.models[id]?.display_name ?? id, org: doc.models[id]?.org ?? "" }))
      .sort((a, b) => a.org.localeCompare(b.org) || a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [doc]);
  const shown = q ? list.filter((m) => `${m.name} ${m.org}`.toLowerCase().includes(q.toLowerCase())) : list;
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="flex flex-col gap-1 border-base-300/60 lg:border-r lg:pr-6">
        <Link to="/models" className="group flex items-center gap-3 rounded-xl p-3 hover:bg-base-200">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content"><Cpu size={17} aria-hidden="true" /></span>
          <span>
            <span className="block text-sm font-semibold">All models</span>
            <span className="block text-xs text-base-content/55">{list.length} models, sortable</span>
          </span>
        </Link>
        <Link to="/recommender" className="group flex items-center gap-3 rounded-xl p-3 hover:bg-base-200">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content"><Compass size={17} aria-hidden="true" /></span>
          <span>
            <span className="block text-sm font-semibold">Model Recommender</span>
            <span className="block text-xs text-base-content/55">Find a model for your work</span>
          </span>
        </Link>
      </div>
      <div className="min-w-0">
        <label className="flex items-center gap-2 border-b border-base-300/60 pb-2 text-sm">
          <Search size={15} className="text-base-content/45" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models" className="w-full bg-transparent outline-none placeholder:text-base-content/40" aria-label="Search models" />
        </label>
        <ul className="mt-2 grid max-h-[52vh] grid-cols-1 gap-x-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((m) => (
            <li key={m.id}>
              <Link to={`/models/${encodeURIComponent(m.id)}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-base-content/75 hover:bg-base-200 hover:text-base-content">
                <ModelLogo model={m.model} size={15} />
                <span className="truncate">{m.name}</span>
              </Link>
            </li>
          ))}
          {!shown.length && <li className="px-2 py-3 text-sm text-base-content/55">No model matches.</li>}
        </ul>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const doc = useResults();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const timer = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const show = (id) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMenu(id), menu ? 0 : 90);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMenu(null), 160);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-300/50 bg-base-100/95 backdrop-blur" onMouseLeave={hide}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="ArchBench home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-base-300/60">
            <img src="/sa4s_logo_final.svg" alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-lg font-bold tracking-tight">ArchBench</span>
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => (item.menu ? show(item.menu) : hide())}
              onFocus={() => item.menu && setMenu(item.menu)}
              aria-haspopup={item.menu ? "true" : undefined}
              aria-expanded={item.menu ? menu === item.menu : undefined}
              className={({ isActive }) =>
                item.highlight
                  ? `mx-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                      isActive ? "border-primary bg-primary text-primary-content" : "border-primary/50 bg-primary/10 text-primary hover:bg-primary hover:text-primary-content"
                    }`
                  : `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      menu && menu === item.menu
                        ? "bg-base-content text-base-100"
                        : isActive
                          ? "bg-primary/10 text-primary"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                    }`
              }
            >
              {item.highlight && <item.icon size={14} aria-hidden="true" />}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3" onMouseEnter={hide}>
          <a
            href={PAPER}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-base-content/70 hover:bg-base-200 hover:text-base-content xl:inline-flex"
          >
            <FileText size={15} aria-hidden="true" /> Paper
          </a>
          <ThemeSelector compact />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="btn btn-ghost btn-sm btn-square lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="absolute inset-x-0 top-full hidden lg:block" onMouseEnter={() => clearTimeout(timer.current)}>
          <div className="menu-drop mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-b-2xl border border-t-0 border-base-300/60 bg-base-100 p-5 shadow-xl shadow-base-content/5">
              {menu === "tasks" ? <TasksMenu doc={doc} /> : <ModelsMenu doc={doc} />}
            </div>
          </div>
        </div>
      )}

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="fade-in border-t border-base-300/50 bg-base-100 px-4 py-3 lg:hidden">
          <div className="grid gap-1 sm:grid-cols-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-primary/10 font-semibold text-primary" : item.highlight ? "border border-primary/40 bg-primary/10 font-semibold text-primary" : "text-base-content/70 hover:bg-base-200"}`}
                >
                  <Icon size={17} aria-hidden="true" /> {item.label}
                </NavLink>
              );
            })}
            <a href={PAPER} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/70 hover:bg-base-200">
              <FileText size={17} aria-hidden="true" /> Read the paper
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
