import React from 'react'
import { useNavigate } from 'react-router-dom';

const Introduction = () => {
  const navigate = useNavigate();

  return (
    <div className="hero bg-base-100">
      <div className="hero-content flex-col lg:flex-row">
        <img
          src="./src/assets/sa4s_logo_final.svg"
          className="w-53 rounded-lg shadow-lg" 
        />
        <div>
          <h1 className="text-5xl font-bold">Architecture Benchmark</h1>
          <p className="py-6">
            Archbench is a leaderboard focused on software architecture benchmarking.<br />
            Our categories include:<br />
            1. Architecture Design Decisions<br />
            2. Serverless Components<br />
            3. Dynamic Service Generation<br />
            We provide a simple way to access data, methods and results through our leaderboards.
          </p>
          <div className="flex justify-center gap-12">
            <button 
              className="btn btn-outline btn-info"
              onClick={() => navigate('/leaderboard')}
            >
              🏆 Leaderboard
            </button>
            <button 
              className="btn btn-outline btn-success"
              onClick={() => navigate('/tasks')}
            >
              ✅ Tasks
            </button>
            <button 
              className="btn btn-outline btn-warning"
              onClick={() => navigate('/')}
            >
              📤 Submit
            </button>
            <button 
              className="btn btn-outline btn-error"
              onClick={() => navigate('/papers')}
            >
              📚 Papers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Introduction