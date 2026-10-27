// Writes the site's paper results as a contract-shaped results file, so it can
// be checked with the CLI validator:
//   node scripts/export-paper-results.mjs out.json
//   python -c "from archbench.export.validate import validate_file; print(validate_file('out.json'))"
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { mapPaperResults } from "../src/lib/paperResults.js";

const dataDir = new URL("../src/data/", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dataDir), "utf8"));
const registry = read("registry.json");
const sources = Object.fromEntries(
  readdirSync(dataDir)
    .filter((f) => f.endsWith("Data.json") && f !== "papersData.json")
    .map((f) => read(f))
    .map((d) => [d.type, d]),
);
const results = mapPaperResults(sources, registry.tasks);
const doc = {
  schema_version: registry.schema_version,
  generated_at: new Date().toISOString(),
  tasks: registry.tasks,
  metrics: registry.metrics,
  tiers: registry.tiers,
  models: read("paperModels.json"),
  results,
};
const ids = new Set(results.map((r) => r.run_id));
if (ids.size !== results.length) throw new Error("duplicate run_id in paper results");
writeFileSync(process.argv[2] ?? "paper-results.json", JSON.stringify(doc, null, 2) + "\n");
console.log(`${results.length} paper rows, ${Object.keys(doc.models).length} models`);
