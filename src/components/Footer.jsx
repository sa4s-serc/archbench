import React from "react";

const Footer = () => {
  return (
    <footer className="footer bg-zinc-300 py-8 border-t border-base-300" data-theme="light">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full">
          {/* SERC Logo */}
          <a
            href="https://serc.iiit.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-32 lg:w-40 h-24 flex items-center"
          >
            <img
              src="/serc_logo_final.svg"
              alt="SERC Logo"
              className="w-full h-full object-contain hover:opacity-75 transition-opacity"
            />
          </a>

          {/* SA4S Logo */}
          <a
            href="https://sa4s-serc.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-32 lg:w-40 h-24 flex items-center"
          >
            <img
              src="/sa4s_logo_final.svg"
              alt="SA4S Logo"
              className="w-full h-full object-contain hover:opacity-75 transition-opacity"
            />
          </a>

          {/* IIIT Logo */}
          <a
            href="https://www.iiit.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-32 lg:w-40 h-24 flex items-center"
          >
            <img
              src="/iiit_logo_final.svg"
              alt="IIIT Hyderabad Logo"
              className="w-full h-full object-contain hover:opacity-75 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;