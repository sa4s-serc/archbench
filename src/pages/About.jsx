import { ExternalLink, Github } from "lucide-react";
import { Container, PageBand } from "../components/ui";

const PARAGRAPHS = [
  "We explore how software architecture principles can be combined with advanced machine learning techniques to tackle the challenges of designing resilient, energy-efficient, and adaptive systems. Our vision is to create systems that are not only functional but also sustainable and adaptable in an ever-changing world.",
  "We develop methodologies, frameworks, and tools that allow software to autonomously adjust its behavior to meet evolving requirements and contexts, with a strong emphasis on energy efficiency and resource optimization. By leveraging machine learning, we aim to enable software systems to learn from their environment and experiences, ensuring continuous improvement and effective adaptation.",
  "We also focus on developing approaches for building sustainable AI-enabled systems, ensuring that the benefits of AI are realized in a resource-conscious and environmentally friendly way. Our work aims to create solutions that respond intelligently to changes in their environment, allowing software to continuously optimize its performance, energy use, and reliability.",
  "We strive to push the boundaries of how software systems are designed and evolved, envisioning a future where software not only meets functional requirements but also contributes positively to societal and environmental sustainability.",
];

export default function About() {
  return (
    <>
      <PageBand
        back={{ to: "/", label: "Home" }}
        title="SA4S Research Group"
        lead="SA4S research group, SERC works at the intersection of software architecture and machine learning, focusing on building sustainable and self-adaptive software systems."
        aside={
          <div className="flex items-center gap-4 rounded-md bg-base-100 p-4">
            <img src="/sa4s_logo_final.svg" alt="SA4S logo" className="h-16 w-16 object-contain" />
            <p className="text-[13px] text-base-content/70">Software Engineering Research Center<br />IIIT Hyderabad</p>
          </div>
        }
      />
      <Container className="mt-10 max-w-[860px]">
        <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-base-content/85">
          {PARAGRAPHS.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://sa4s-serc.github.io/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[14px] text-primary-content">
            <ExternalLink size={15} aria-hidden="true" /> Visit the SA4S website
          </a>
          <a href="https://github.com/sa4s-serc/archbench" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-base-300 px-4 py-2 text-[14px] hover:bg-base-200">
            <Github size={15} aria-hidden="true" /> GitHub repository
          </a>
        </div>
      </Container>
    </>
  );
}
