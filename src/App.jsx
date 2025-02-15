import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Leaderboard from "./pages/Leaderboard";
import Tasks from "./pages/Tasks";
import Papers from "./pages/Papers";
import About from "./pages/About";
import Homepage from "./pages/Homepage";
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;