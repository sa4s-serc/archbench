import { ExternalIcon, Page } from "../components/ui";

const paragraphs = [
  "We explore how software architecture principles can be combined with advanced machine learning techniques to tackle the challenges of designing resilient, energy-efficient, and adaptive systems. Our vision is to create systems that are not only functional but also sustainable and adaptable in an ever-changing world.",
  "We develop methodologies, frameworks, and tools that allow software to autonomously adjust its behavior to meet evolving requirements and contexts, with a strong emphasis on energy efficiency and resource optimization. By leveraging machine learning, we aim to enable software systems to learn from their environment and experiences, ensuring continuous improvement and effective adaptation.",
  "We also focus on developing approaches for building sustainable AI-enabled systems, ensuring that the benefits of AI are realized in a resource-conscious and environmentally friendly way. Our work aims to create solutions that respond intelligently to changes in their environment, allowing software to continuously optimize its performance, energy use, and reliability.",
  "We strive to push the boundaries of how software systems are designed and evolved, envisioning a future where software not only meets functional requirements but also contributes positively to societal and environmental sustainability.",
];

const About = () => (
  <Page>
    <header className="flex max-w-3xl flex-col gap-5 pt-10 sm:pt-14">
      <img src="/sa4s_logo_final.svg" alt="SA4S logo" className="h-16 w-16" />
      <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.022em] sm:text-[40px] sm:leading-[1.1]">SA4S research group</h1>
      <p className="text-ink-2">Software Engineering Research Center, IIIT Hyderabad</p>
      <p className="text-[19px] leading-relaxed text-ink">
        SA4S works at the intersection of software architecture and machine learning, focusing on building sustainable and
        self-adaptive software systems.
      </p>
    </header>
    <div className="mt-8 flex max-w-2xl flex-col gap-5 text-[15px] leading-relaxed text-ink-2">
      {paragraphs.map((text) => <p key={text.slice(0, 32)}>{text}</p>)}
    </div>
    <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <a href="https://sa4s-serc.github.io/" target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
        SA4S website <ExternalIcon size={12} />
      </a>
      <a href="https://github.com/sa4s-serc/archbench" target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
        ArchBench on GitHub <ExternalIcon size={12} />
      </a>
    </div>
  </Page>
);

export default About;
