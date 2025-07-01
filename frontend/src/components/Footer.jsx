import React from "react";

const Footer = () => {
  return (
    <footer className="footer bg-base-200 py-8 border-t border-base-300">
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-32 max-w-9xl mx-auto">
          {/* SERC Logo */}
          <a
            href="https://serc.iiit.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center"
          >
            <div className="w-32 h-24 flex items-center">
              <img
                src="/serc_logo_final.svg"
                alt="SERC Logo"
                className="w-full h-full object-contain hover:opacity-75 transition-opacity"
              />
            </div>
          </a>

          {/* SA4S Logo */}
          <a
            href="https://sa4s-serc.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center"
          >
            <div className="w-32 h-24 flex items-center">
              <img
                src="/sa4s_logo_final.svg"
                alt="SA4S Logo"
                className="w-full h-full object-contain hover:opacity-75 transition-opacity"
              />
            </div>
          </a>

          {/* IIIT Logo */}
          <a
            href="https://www.iiit.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center"
          >
            <div className="w-32 h-24 flex items-center">
              <img
                src="/iiit_logo_final.svg"
                alt="IIIT Hyderabad Logo"
                className="w-full h-full object-contain hover:opacity-75 transition-opacity"
              />
            </div>
          </a>
        </div>

        <div className="divider my-4"></div>

        <div className="w-full text-center text-sm text-base-content/70">
          <p>&copy; {new Date().getFullYear()} ArchBench. All rights reserved.</p>
          <p className="mt-2">
            A project by Software Architecture for Software Services (SA4S) Lab,
            SERC, IIIT Hyderabad
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;