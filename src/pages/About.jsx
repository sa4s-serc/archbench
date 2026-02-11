import React from "react";
import { Github, ExternalLink } from "lucide-react";
import TopBar from "../components/TopBar";

const About = () => {
  const sections = [
    {
      text: "SA4S research group, SERC works at the intersection of software architecture and machine learning, focusing on building sustainable and self-adaptive software systems.",
      highlight: true,
    },
    {
      text: "We explore how software architecture principles can be combined with advanced machine learning techniques to tackle the challenges of designing resilient, energy-efficient, and adaptive systems. Our vision is to create systems that are not only functional but also sustainable and adaptable in an ever-changing world.",
    },
    {
      text: "We develop methodologies, frameworks, and tools that allow software to autonomously adjust its behavior to meet evolving requirements and contexts, with a strong emphasis on energy efficiency and resource optimization. By leveraging machine learning, we aim to enable software systems to learn from their environment and experiences, ensuring continuous improvement and effective adaptation.",
    },
    {
      text: "We also focus on developing approaches for building sustainable AI-enabled systems, ensuring that the benefits of AI are realized in a resource-conscious and environmentally friendly way. Our work aims to create solutions that respond intelligently to changes in their environment, allowing software to continuously optimize its performance, energy use, and reliability.",
    },
    {
      text: "We strive to push the boundaries of how software systems are designed and evolved, envisioning a future where software not only meets functional requirements but also contributes positively to societal and environmental sustainability.",
    },
  ];

  return (
    <>
      <TopBar title="About" subtitle="SA4S Research Group" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Hero card */}
        <div className="rounded-2xl bg-base-200/50 border border-base-300/50 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src="/sa4s_logo_final.svg"
              alt="SA4S Logo"
              className="w-24 h-24 rounded-2xl shadow-lg"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                SA4S Research Group
              </h2>
              <p className="text-base-content/60">
                Software Engineering Research Center, IIIT Hyderabad
              </p>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-4 mb-12">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all ${section.highlight
                  ? "bg-primary/5 border-primary/20"
                  : "bg-base-200/30 border-base-300/30"
                }`}
            >
              <p
                className={`leading-relaxed text-sm ${section.highlight
                    ? "text-base-content font-medium"
                    : "text-base-content/70"
                  }`}
              >
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pb-8">
          <a
            href="https://sa4s-serc.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary rounded-xl gap-2"
          >
            <ExternalLink size={16} />
            Visit SA4S Website
          </a>
          <a
            href="https://github.com/sa4s-serc/archbench"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline rounded-xl gap-2"
          >
            <Github size={16} />
            GitHub Repository
          </a>
        </div>
      </div>
    </>
  );
};

export default About;