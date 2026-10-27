import { Link } from "react-router-dom";

const LOGOS = [
  { href: "https://serc.iiit.ac.in/", src: "/serc.png", alt: "Software Engineering Research Center" },
  { href: "https://sa4s-serc.github.io/", src: "/sa4s_logo_final.svg", alt: "SA4S research group" },
  { href: "https://www.iiit.ac.in/", src: "/iiit_logo_final.svg", alt: "IIIT Hyderabad" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-md flex-col gap-3">
          <p className="text-sm leading-relaxed text-ink-2">
            ArchBench is built by the SA4S group at the Software Engineering Research Center, IIIT Hyderabad.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/about" className="link">About</Link>
            <Link to="/contribute" className="link">Contribute</Link>
            <a href="https://github.com/sa4s-serc/archbench" className="link">GitHub</a>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {LOGOS.map((logo) => (
            <a key={logo.href} href={logo.href} target="_blank" rel="noopener noreferrer" className="opacity-70 transition-opacity duration-150 hover:opacity-100">
              <img src={logo.src} alt={logo.alt} className="h-10 w-auto object-contain" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
