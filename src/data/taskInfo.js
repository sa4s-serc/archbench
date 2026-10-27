// Presentation details per task that the results file does not carry: the
// long description, dataset and paper links, the worked example and task facts.
import adr from "./adrGenData.json";
import traceability from "./traceabilityData.json";
import diagram from "./diagramData.json";
import serverless from "./serverlessData.json";
import dynamic from "./dynamicGenData.json";
import microservice from "./microserviceData.json";

export const PAPER_SOURCES = { adr, traceability, diagram, serverless, dynamic, microservice };

const facts = {
  adr: [
    ["Input", "Architecture documentation in markdown"],
    ["Output", "Architecture Decision Records in markdown"],
    ["Dataset", `${adr.dataset_size || "1000"} architecture documents`],
  ],
  traceability: [
    ["Input", "Architecture documentation (SAD), architecture models (SAM) and source code"],
    ["Output", "CSV trace links: sentence to component, or sentence to code"],
    ["Scenarios", `${traceability.task_types ? traceability.task_types.length : 4} traceability scenarios`],
    ["Dataset", traceability.dataset_info ? `${traceability.dataset_info.projects.length} projects: ${traceability.dataset_info.projects.join(", ")}` : "ArDoCo benchmark, 5 open-source projects"],
  ],
  diagram: [
    ["Input", "Repository summary in JSONL: code structure, components, architectural styles"],
    ["Output", "PlantUML C4 diagram, rendered to PNG"],
    ["Dataset", "339 open-source repositories with ground-truth architecture views"],
  ],
  serverless: [
    ["Input", "Function specification, codebase summary and function description"],
    ["Output", "Serverless (FaaS) function implementation"],
    ["Settings", "Without intervention, and after human review and edits"],
  ],
  dynamic: [
    ["Input", "Query describing the service requirements"],
    ["Output", "Generated IoT service implementation"],
    ["Comparison", "Reference implementation for each query"],
  ],
  microservice: [
    ["Input", "Requirements plus codebase context (incremental), or requirements only (clean state)"],
    ["Output", "Complete microservice implementation in Java or Python"],
    ["Dataset", "PiggyMetrics, Train-Ticket, TeamSync, Project-Management, MicroBank"],
  ],
};

const examples = {
  adr: ["adrExample.md", "Example ADR"],
  traceability: ["traceabilityExample.md", "Example traceability task"],
  diagram: ["diagramExample.md", "Example architecture view task"],
  serverless: ["serverlessExample.md", "Example serverless function"],
  dynamic: ["dynamicExample.md", "Example IoT service"],
  microservice: ["microserviceExample.md", "Example microservice task"],
};

// Short labels for tight spaces (matrix headers, phone layouts).
const shortNames = {
  adr: "ADR",
  traceability: "Traceability",
  diagram: "Diagram",
  serverless: "Serverless",
  dynamic: "Dynamic IoT",
  microservice: "Microservice",
};

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

// Source metric names that differ from the registry's metric keys.
const METRIC_ALIASES = {
  f1score: ["f1"],
  weightedaveragef1: ["weighted_avg_f1"],
  sourcelinesofcode: ["sloc"],
  halsteadsvolume: ["halstead_volume"],
  testpassrate: ["test_pass_rate_p1", "test_pass_rate_p2"],
  generationtime: ["avg_time_min"],
  generationcost: ["avg_cost_usd"],
};

// Notes for metrics only the in-house sweep reports.
const EXTRA_NOTES = {
  rouge2: "Overlap of word pairs (bigrams) between generated and reference text",
  rougel: "Longest common subsequence between generated and reference text",
  sam: "Spectral angle between the generated and ground-truth images, in radians",
  sre: "Signal-to-reconstruction error ratio, in decibels",
  uiq: "Universal image quality index: correlation, luminance and contrast combined",
};

function metricNotes(source) {
  const notes = { ...EXTRA_NOTES };
  for (const metric of source?.metrics ?? []) {
    const name = normalize(metric.name);
    for (const key of METRIC_ALIASES[name] ?? [name]) notes[normalize(key)] = metric.description;
  }
  return (key) => notes[normalize(key)] ?? null;
}

export function taskInfo(id) {
  const source = PAPER_SOURCES[id];
  const [exampleFile, exampleTitle] = examples[id] ?? [];
  return {
    shortName: shortNames[id] ?? id,
    summary: source?.short_description ?? "",
    description: source?.long_description ?? "",
    paperLink: source?.paper_link ?? null,
    codeLink: source?.github_link ?? null,
    datasetLink: source?.dataset_link ?? null,
    exampleFile: source?.example_available ? exampleFile : null,
    exampleTitle,
    facts: facts[id] ?? [],
    metricNote: metricNotes(source),
  };
}
