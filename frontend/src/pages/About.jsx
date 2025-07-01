import React from 'react';
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="py-12 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-base-100 p-6 rounded-2xl shadow-xl border border-base-300">
            <div className="md:w-1/3 flex justify-center">
              <img
                src="/sa4s_logo_final.svg"
                alt="SA4S Logo"
                className="w-64 max-w-full h-auto object-contain rounded-lg transition-all duration-300 hover:scale-105"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                About SA4S Research Group
              </h1>
              <div className="bg-base-200 p-6 rounded-xl shadow-md border border-base-300">
                <p className="text-lg">
                  SA4S research group, SERC works at the intersection of software architecture
                  and machine learning, focusing on building sustainable and self-adaptive
                  software systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Focus Areas */}
      <section className="py-12 px-4 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Research Focus</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary mb-3">Machine Learning Integration</h3>
                <p className="leading-relaxed">
                  We explore how software architecture principles can be combined with
                  advanced machine learning techniques to tackle the challenges of designing
                  resilient, energy-efficient, and adaptive systems. Our vision is to create
                  systems that are not only functional but also sustainable and adaptable in
                  an ever-changing world.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary mb-3">Tools & Frameworks</h3>
                <p className="leading-relaxed">
                  We develop methodologies, frameworks, and tools that allow software to
                  autonomously adjust its behavior to meet evolving requirements and contexts,
                  with a strong emphasis on energy efficiency and resource optimization. By leveraging
                  machine learning, we aim to enable software systems to learn from their environment
                  and experiences, ensuring continuous improvement and effective adaptation.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary mb-3">Sustainable AI Systems</h3>
                <p className="leading-relaxed">
                  We also focus on developing approaches for building sustainable AI-enabled systems,
                  ensuring that the benefits of AI are realized in a resource-conscious and
                  environmentally friendly way. Our work aims to create solutions that respond
                  intelligently to changes in their environment, allowing software to continuously
                  optimize its performance, energy use, and reliability.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title text-primary mb-3">Future Directions</h3>
                <p className="leading-relaxed">
                  We strive to push the boundaries of how software systems are designed and evolved,
                  envisioning a future where software not only meets functional requirements but also
                  contributes positively to societal and environmental sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;