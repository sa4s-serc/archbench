import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Leaderboard from "./pages/Leaderboard";
import Tasks from "./pages/Tasks";
import Papers from "./pages/Papers";
import About from "./pages/About";
import Homepage from "./pages/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./pages/Admin";
import { Analytics } from '@vercel/analytics/react';
import "./App.css";

// Layout component to handle sidebar and main content
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Mobile-only topbar */}
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Sidebar - now on the left side */}
        <Sidebar />

        {/* Main content - with proper padding to account for sidebar */}
        <div className="flex-1 transition-all duration-300 w-full lg:pl-64">
          {children}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login onLoginSuccess={() => window.location.href = '/'} />} />
          <Route path="/register" element={<Register onRegisterSuccess={() => window.location.href = '/'} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
      <Analytics />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;