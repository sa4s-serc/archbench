import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Frown } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="text-9xl font-bold text-primary">
            404
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <Frown size={64} className="text-base-content/40" />
        </div>

        <h1 className="text-4xl font-bold mb-3">Page Not Found</h1>
        
        <p className="text-lg text-base-content/60 mb-2">
          Oopsie Woopsie!
          <br />
          Looks like this architecture doesn't exist in our design system!
        </p>

        <div className="my-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary gap-2 rounded-xl"
          >
            <Home size={18} />
            Go Home
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="btn btn-outline rounded-xl"
          >
            🏆 Back to Leaderboard
          </button>
        </div>

        <div className="mt-12 p-6 bg-base-200/30 rounded-2xl border border-base-300/50 max-w-md mx-auto">
          <p className="text-sm text-base-content/60 italic">
            "It's not a bug, it's a feature... of the internet." 
            <br />- Everyone, probably
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
