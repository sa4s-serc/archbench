import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Hero Section with Logo */}
      <div className="hero bg-base-100 rounded-lg mb-8">
        <div className="hero-content flex-col lg:flex-row gap-8">
          <img
            src="/sa4s_logo_final.svg"
            alt="SA4S Logo"
            className="w-64 rounded-lg shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold mb-6">About SA4S Research Group</h1>
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
              <p className="text-lg">
                SA4S research group, SERC works at the intersection of software architecture 
                and machine learning, focusing on building sustainable and self-adaptive 
                software systems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 mb-12">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <p className="text-base-content/80 leading-relaxed">
              We explore how software architecture principles can be combined with 
              advanced machine learning techniques to tackle the challenges of designing 
              resilient, energy-efficient, and adaptive systems. Our vision is to create 
              systems that are not only functional but also sustainable and adaptable in 
              an ever-changing world.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <p className="text-base-content/80 leading-relaxed">
              We develop methodologies, frameworks, and tools that allow software to 
              autonomously adjust its behavior to meet evolving requirements and contexts, 
              with a strong emphasis on energy efficiency and resource optimization. By leveraging 
              machine learning, we aim to enable software systems to learn from their environment 
              and experiences, ensuring continuous improvement and effective adaptation.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <p className="text-base-content/80 leading-relaxed">
              We also focus on developing approaches for building sustainable AI-enabled systems, 
              ensuring that the benefits of AI are realized in a resource-conscious and 
              environmentally friendly way. Our work aims to create solutions that respond 
              intelligently to changes in their environment, allowing software to continuously 
              optimize its performance, energy use, and reliability.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <p className="text-base-content/80 leading-relaxed">
              We strive to push the boundaries of how software systems are designed and evolved, 
              envisioning a future where software not only meets functional requirements but also 
              contributes positively to societal and environmental sustainability.
            </p>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 items-center pb-8">
        <a
          href="https://sa4s-serc.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary gap-2"
        >
          <ExternalLink size={20} />
          Visit SA4S Website
        </a>
        <a
          href="https://github.com/sa4s-serc/archbench"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary gap-2"
        >
          <Github size={20} />
          GitHub Repository
        </a>
      </div>
    </div>
  );
};

export default About;