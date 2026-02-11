import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-base-300/50 bg-base-200/30 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Logos */}
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
            <a
              href="https://serc.iiit.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-28 lg:w-36 h-20 flex items-center opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/serc.png"
                alt="SERC Logo"
                className="w-full h-full object-contain"
              />
            </a>
            <a
              href="https://sa4s-serc.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-28 lg:w-36 h-20 flex items-center opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/sa4s_logo_final.svg"
                alt="SA4S Logo"
                className="w-full h-full object-contain"
              />
            </a>
            <a
              href="https://www.iiit.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-28 lg:w-36 h-20 flex items-center opacity-60 hover:opacity-100 transition-opacity"
            >
              <img
                src="/iiit_logo_final.svg"
                alt="IIIT Hyderabad Logo"
                className="w-full h-full object-contain"
              />
            </a>
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-base-300" />

          {/* Bottom text */}
          <p className="text-xs text-base-content/30 text-center">
            Built with ❤️ for the Software Architecture Community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;