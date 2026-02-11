import React, { useState, useRef, useEffect } from "react";
import adrGeneration from "../data/adrGenData.json";
import dynamicData from "../data/dynamicGenData.json";
import serverlessData from "../data/serverlessData.json";
import traceabilityData from "../data/traceabilityData.json";
import Footer from "../components/Footer";
import ThemeSelector from "../components/ThemeSelector";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Sparkles,
  BarChart3,
  GitBranch,
  Layers,
  Send,
  ChevronDown,
} from "lucide-react";

const Homepage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalSubmissions =
    adrGeneration.entries.length +
    dynamicData.entries.length +
    serverlessData.entries.length +
    traceabilityData.entries.length;

  const latestDate = new Date(
    Math.max(
      ...adrGeneration.entries.map((e) => new Date(e.date).getTime()),
      ...serverlessData.entries.map((e) => new Date(e.date).getTime()),
      ...dynamicData.entries.map((e) => new Date(e.date).getTime()),
      ...traceabilityData.entries.map((e) => new Date(e.date).getTime())
    )
  )
    .toISOString()
    .split("T")[0];

  const categories = [
    {
      icon: Layers,
      title: "ADR Generation",
      desc: "Evaluate LLMs on generating Architecture Decision Records from documentation.",
    },
    {
      icon: GitBranch,
      title: "Serverless Functions",
      desc: "Benchmark code generation for serverless architectural components.",
    },
    {
      icon: Sparkles,
      title: "Dynamic Services",
      desc: "Assess dynamic IoT service generation through mixed-initiative interaction.",
    },
    {
      icon: BarChart3,
      title: "Architecture Traceability",
      desc: "Trace links between architecture documentation, models, and source code.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-base-100 overflow-hidden">
        {/* Floating navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between bg-base-200/70 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 border border-base-300/50 shadow-lg">
              <div className="flex items-center gap-2">
                <img
                  src="/sa4s_logo_final.svg"
                  alt="SA4S Logo"
                  className="h-8 w-8 rounded-lg"
                />
                <span className="font-bold text-base sm:text-lg tracking-tight">
                  ArchBench
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile menu dropdown */}
                <div className="relative sm:hidden" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <ul className="menu menu-sm absolute right-0 mt-6 z-[1] p-2 shadow bg-base-200 backdrop-blur-xl rounded-box w-52 border border-base-300/50">
                      <li>
                        <button className="text-md font-semibold py-2" onClick={() => { navigate("/leaderboard"); setMenuOpen(false); }}>
                          Leaderboard
                        </button>
                      </li>
                      <li>
                        <button className="text-md font-semibold py-2" onClick={() => { navigate("/tasks"); setMenuOpen(false); }}>
                          Tasks
                        </button>
                      </li>
                      <li>
                        <button className="text-md font-semibold py-2" onClick={() => { navigate("/papers"); setMenuOpen(false); }}>
                          Papers
                        </button>
                      </li>
                      <li>
                        <button className="text-md font-semibold py-2" onClick={() => { navigate("/about"); setMenuOpen(false); }}>
                          About
                        </button>
                      </li>
                      <li>
                        <button className="text-md font-semibold py-2" onClick={() => { navigate("/contribute"); setMenuOpen(false); }}>
                          Contribute
                        </button>
                      </li>
                      <li className="border-t border-base-300/50 mt-1 pt-1">
                        <div className="flex items-center justify-between px-2 py-1">
                          <span className="text-xs">Theme</span>
                          <ThemeSelector />
                        </div>
                      </li>
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="hidden sm:inline-flex btn btn-ghost btn-sm rounded-xl"
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => navigate("/tasks")}
                  className="hidden sm:inline-flex btn btn-ghost btn-sm rounded-xl"
                >
                  Tasks
                </button>
                <button
                  onClick={() => navigate("/papers")}
                  className="hidden sm:inline-flex btn btn-ghost btn-sm rounded-xl"
                >
                  Papers
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="hidden sm:inline-flex btn btn-ghost btn-sm rounded-xl"
                >
                  About
                </button>
                <button
                  onClick={() => navigate("/contribute")}
                  className="hidden sm:inline-flex btn btn-ghost btn-sm rounded-xl"
                >
                  Contribute
                </button>
                <div className="hidden ml-4 sm:block">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
          {/* Subtle dot grid background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_oklch(var(--bc)/0.069)_2px,_transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Logos row */}
            {/* <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10 animate-fade-in-up">
              <a href="https://serc.iiit.ac.in/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src="/serc_logo_final.svg" alt="SERC" className="h-14 sm:h-20 w-auto" />
              </a>
              <div className="w-px h-12 bg-base-content/10" />
              <a href="https://sa4s-serc.github.io/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src="/sa4s_logo_final.svg" alt="SA4S" className="h-14 sm:h-20 w-auto" />
              </a>
              <div className="w-px h-12 bg-base-content/10" />
              <a href="https://www.iiit.ac.in/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src="/iiit_logo_final.svg" alt="IIIT Hyderabad" className="h-14 sm:h-20 w-auto" />
              </a>
            </div> */}

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in-up animation-delay-200">
              <Sparkles size={14} className="hidden xs:block" />
              <span className="text-center">Software Architecture Research Benchmark</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 animate-fade-in-up animation-delay-400">
              <span className="text-base-content">
                ArchBench
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-base-content/50 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4 animate-fade-in-up animation-delay-600">
              A comprehensive benchmark for software architecture tasks.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Explore leaderboards, compare approaches, and advance the field.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 animate-fade-in-up animation-delay-800">
              <button
                className="btn btn-primary btn-md sm:btn-lg rounded-2xl gap-2 px-6 sm:px-8 shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
                onClick={() => navigate("/leaderboard")}
              >
                <Trophy size={18} className="sm:w-5 sm:h-5" />
                Explore Leaderboard
              </button>
              <button
                className="btn btn-ghost btn-md sm:btn-lg rounded-2xl gap-2 border border-base-300 hover:border-base-content/20 bg-base-100 w-full sm:w-auto"
                onClick={() => navigate("/tasks")}
              >
                View Tasks
                <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-2 sm:gap-4 max-w-lg mx-auto mt-12 sm:mt-16 px-4 animate-fade-in-up animation-delay-800">
              <div className="text-center px-2 sm:px-4 flex-shrink-0">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
                  {totalSubmissions}
                </div>
                <div className="text-[10px] sm:text-xs text-base-content/40 mt-1 uppercase tracking-wider">
                  Total<span className="hidden xs:inline"> Submissions</span>
                </div>
              </div>
              <div className="text-center px-2 sm:px-4 border-x border-base-content/10 flex-shrink-0">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
                  4
                </div>
                <div className="text-[10px] sm:text-xs text-base-content/40 mt-1 uppercase tracking-wider">
                  Categories
                </div>
              </div>
              <div className="text-center px-2 sm:px-4 flex-shrink-0">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
                  {new Date(latestDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-[10px] sm:text-xs text-base-content/40 mt-1 uppercase tracking-wider whitespace-nowrap">
                  Last Updated
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={() =>
                document.getElementById("categories").scrollIntoView({ behavior: "smooth" })
              }
              className="flex flex-col items-center gap-1 text-base-content/30 hover:text-base-content/50 transition-colors"
            >
              <span className="text-xs uppercase tracking-widest">Explore</span>
              <ChevronDown size={18} className="animate-bounce" />
            </button>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="relative py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                What We Evaluate
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                Benchmark Categories
              </h3>
              <p className="text-base-content/50 max-w-xl mx-auto">
                Evaluate approaches across the various dimensions of software architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={idx}
                    className="group relative p-6 rounded-2xl bg-base-200/50 border border-base-300/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate("/tasks")}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">{cat.title}</h4>
                    <p className="text-sm text-base-content/50 leading-relaxed">
                      {cat.desc}
                    </p>
                    <ArrowRight
                      size={16}
                      className="absolute top-6 right-6 text-base-content/15 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-base-200 border border-base-300/50 p-8 sm:p-12 text-center">
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-6 border border-primary/20">
                  <Send size={12} />
                  Open for Submissions
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Contribute?
                </h2>
                <p className="text-base-content/50 max-w-lg mx-auto mb-8">
                  Join the benchmark and help advance software architecture
                  research. Submit your results and compare with state-of-the-art
                  approaches.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    className="btn btn-primary rounded-2xl gap-2 px-6"
                    onClick={() => navigate("/contribute")}
                  >
                    <Send size={16} />
                    Contribute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Homepage;
