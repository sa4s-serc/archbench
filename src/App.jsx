import { useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { ResultsProvider } from "./lib/ResultsContext";
import SiteNav from "./components/SiteNav";
import ExampleBanner from "./components/ExampleBanner";
import Footer from "./components/Footer";
import Leaderboard from "./pages/Leaderboard";
import Tasks from "./pages/Tasks";
import Papers from "./pages/Papers";
import About from "./pages/About";
import Contribute from "./pages/Contribute";
import Guidelines from "./pages/Guidelines";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function App() {
  return (
    <>
      <Router>
        <ResultsProvider>
          <MotionConfig reducedMotion="user">
            <ScrollToTop />
            <div className="flex min-h-screen flex-col bg-page text-ink">
              <SiteNav />
              <ExampleBanner />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Leaderboard />} />
                  <Route path="/leaderboard" element={<Navigate to="/" replace />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/guidelines" element={<Guidelines />} />
                  <Route path="/papers" element={<Papers />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contribute" element={<Contribute />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </MotionConfig>
        </ResultsProvider>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
