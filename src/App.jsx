import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Leaderboard from "./pages/Leaderboard";
import Tasks from "./pages/Tasks";
import Papers from "./pages/Papers";
import About from "./pages/About";
import Homepage from "./pages/Homepage";
import Contribute from "./pages/Contribute";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-base-100">
      {!isHome && (
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      )}

      <main
        className={`transition-all duration-300 ${!isHome
          ? sidebarCollapsed
            ? "lg:ml-[72px] pb-20 lg:pb-0"
            : "lg:ml-60 pb-20 lg:pb-0"
          : ""
          }`}
      >
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <AppLayout />
      </Router>
      <Analytics />
    </>
  );
}

export default App;