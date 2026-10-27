# ArchBench - Architecture Benchmark

Website for ArchBench, a benchmark for language models on six software-architecture tasks:
ADR generation, architecture traceability link recovery, architecture view (diagram) generation,
serverless component generation, dynamic IoT service generation and microservice generation.

To run
```bash
npm i
npm run dev
```

By default, website should start up at 5173.

## Where the results come from

The site reads one results document in the shape of the ArchBench results contract
(`archbench-cli`, `archbench/export/schema.json`):

- **Registry**: tasks, metrics (with their direction: higher, lower or descriptive) and size
  tiers, in `src/data/registry.json`.
- **Paper results**: edit the per-task files in `src/data/*Data.json`. They are mapped into
  contract rows by `src/lib/paperResults.js`; models they mention are described in
  `src/data/paperModels.json`.
- **In-house sweep**: put the file written by `archbench export` at
  `src/data/inhouse-results.json`. Its paper rows are ignored, since the site maps its own.

In development, open any page with `?data=example` to load the contract's fake fixture
(`fixtures/archbench-results.example.json`) and see the in-house charts; `?data=real` switches
back. The fixture is never included in production builds.

To check the mapped paper rows with the CLI validator:

```bash
node scripts/export-paper-results.mjs /tmp/paper-results.json
python -c "from archbench.export.validate import validate_file; print(validate_file('/tmp/paper-results.json'))"
```
