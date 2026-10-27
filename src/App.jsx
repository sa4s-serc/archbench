import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { ResultsProvider } from "./lib/ResultsContext";
import SiteNav from "./components/SiteNav";
import ExampleBanner from "./components/ExampleBanner";
import Footer from "./components/Footer";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";

// The overview loads with the app; other pages load when first visited.
const Tasks = lazy(() => import("./pages/Tasks"));
const TaskPage = lazy(() => import("./pages/TaskPage"));
const Models = lazy(() => import("./pages/Models"));
const ModelPage = lazy(() => import("./pages/ModelPage"));
const Papers = lazy(() => import("./pages/Papers"));
const About = lazy(() => import("./pages/About"));
const Contribute = lazy(() => import("./pages/Contribute"));
const Guidelines = lazy(() => import("./pages/Guidelines"));

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
                <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/leaderboard" element={<Navigate to="/" replace />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/tasks/:taskId" element={<TaskPage />} />
                  <Route path="/models" element={<Models />} />
                  <Route path="/models/:modelId" element={<ModelPage />} />
                  <Route path="/guidelines" element={<Guidelines />} />
                  <Route path="/papers" element={<Papers />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contribute" element={<Contribute />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
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
