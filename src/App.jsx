import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ResultsProvider } from "./lib/ResultsContext";
import SiteHeader from "./components/SiteHeader";
import ExampleBanner from "./components/ExampleBanner";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Load a page on first visit. If its file is gone (the site was redeployed
// while this tab was open), reload once to pick up the new version.
const page = (load) =>
  lazy(() =>
    load().catch((error) => {
      const key = "archbench:reloaded";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }),
  );

const Leaderboard = page(() => import("./pages/Leaderboard"));
const Models = page(() => import("./pages/Models"));
const ModelPage = page(() => import("./pages/ModelPage"));
const Recommender = page(() => import("./pages/Recommender"));
const Methodology = page(() => import("./pages/Methodology"));
const Papers = page(() => import("./pages/Papers"));
const About = page(() => import("./pages/About"));
const Contribute = page(() => import("./pages/Contribute"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      sessionStorage.removeItem("archbench:reloaded");
    } catch {
      // Storage can be unavailable; the reload guard then simply does not reset.
    }
  }, [pathname]);
  return null;
}

// Older links: /leaderboard?task=adr and /tasks/adr.
function LegacyTask() {
  const { taskId } = useParams();
  const query = new URLSearchParams(useLocation().search).get("task");
  const id = taskId ?? query;
  return <Navigate to={id ? `/leaderboard/${id}` : "/leaderboard/adr"} replace />;
}

function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <SiteHeader />
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="bp-grid bp-fade pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden="true" />
        <ExampleBanner />
        <main key={pathname.startsWith("/leaderboard") ? "/leaderboard" : pathname} className="page-enter relative flex-1">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/leaderboard" element={<LegacyTask />} />
              <Route path="/leaderboard/:taskId" element={<Leaderboard />} />
              <Route path="/tasks" element={<LegacyTask />} />
              <Route path="/tasks/:taskId" element={<LegacyTask />} />
              <Route path="/models" element={<Models />} />
              <Route path="/models/:modelId" element={<ModelPage />} />
              <Route path="/recommender" element={<Recommender />} />
              <Route path="/guidelines" element={<Navigate to="/recommender" replace />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/about" element={<About />} />
              <Route path="/contribute" element={<Contribute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Router>
        <ResultsProvider>
          <ScrollToTop />
          <Layout />
        </ResultsProvider>
      </Router>
      <Analytics />
    </>
  );
}
