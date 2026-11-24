import { Link } from "react-router-dom";
import { useResults } from "../lib/ResultsContext";

const LOGOS = [
  { href: "https://serc.iiit.ac.in/", src: "/serc.png", alt: "Software Engineering Research Center" },
  { href: "https://sa4s-serc.github.io/", src: "/sa4s_logo_final.svg", alt: "SA4S research group" },
  { href: "https://www.iiit.ac.in/", src: "/iiit_logo_final.svg", alt: "IIIT Hyderabad" },
];

export default function Footer() {
  const doc = useResults();
  const updated = doc.generatedAt ? new Date(doc.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <footer className="border-t border-base-300/50 bg-base-200/30 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4">
        <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
          {LOGOS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="flex h-20 w-28 items-center rounded-xl bg-white p-2 opacity-80 transition-opacity hover:opacity-100 lg:w-36">
              <img src={l.src} alt={l.alt} className="h-full w-full object-contain" />
            </a>
          ))}
        </div>
        <div className="h-px w-16 bg-base-300" />
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-base-content/50">
          <Link to="/methodology" className="hover:text-base-content">Methodology</Link>
          <Link to="/contribute" className="hover:text-base-content">Contribute</Link>
          <a href="https://github.com/sa4s-serc/archbench" className="hover:text-base-content">GitHub</a>
          {updated && <span>Results updated {updated}</span>}
        </div>
      </div>
    </footer>
  );
}
