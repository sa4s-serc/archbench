# Architecture View Generation - Example Task

This example demonstrates the task using the `octocat/Hello-World` repository from the benchmark dataset.

## Input: Repository Summary (JSONL)

Each instance is a JSONL record produced by the summary extraction pipeline. The `summary` field condenses the repository's structure, components, and architectural intent into a textual description for the LLM.

```json
{
  "instance_id": "octocat_Hello-World",
  "repo_url": "https://github.com/octocat/Hello-World",
  "summary": "A web application with a client-server architecture. The frontend is a React SPA served via Nginx. The backend is a Node.js REST API backed by a PostgreSQL database. A Redis cache sits between the API and the database for frequently-accessed query results. All components are containerised with Docker and orchestrated via Docker Compose.",
  "ground_truth_image": "ground_truth_views/octocat_Hello-World.png"
}
```

## Prompt Structure (Zero-Shot)

```
You are a software architect. Given the following repository summary, generate a PlantUML architecture diagram that accurately represents the system's components and their relationships.

Use standard PlantUML C4 or component notation. Only output the PlantUML code between @startuml and @enduml tags.

Repository summary:
{SUMMARY}
```

## Generated Output: PlantUML Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(user, "User", "Interacts via browser")

System_Boundary(app, "Hello-World App") {
    Container(nginx, "Nginx", "Web Server", "Serves the React SPA and proxies API requests")
    Container(react, "React SPA", "JavaScript / React", "Single-page frontend application")
    Container(api, "Node.js API", "JavaScript / Express", "Handles business logic and REST endpoints")
    ContainerDb(postgres, "PostgreSQL", "Relational DB", "Stores persistent application data")
    ContainerDb(redis, "Redis", "In-memory Cache", "Caches frequently-accessed query results")
}

Rel(user, nginx, "HTTPS")
Rel(nginx, react, "Serves static assets")
Rel(nginx, api, "Proxies /api requests")
Rel(api, redis, "Cache read/write")
Rel(api, postgres, "Queries")
@enduml
```

The PlantUML code is compiled to PNG using the `plantuml` binary and compared against the ground-truth image.

## Evaluation

Generated and ground-truth images are paired by filename stem and compared using image similarity metrics:

- **SSIM** (Structural Similarity Index) - measures perceived visual similarity; higher is better; primary metric; threshold >= 0.70
- **PSNR** (Peak Signal-to-Noise Ratio) - measures reconstruction quality in dB; higher is better
- **RMSE** (Root Mean Square Error) - measures pixel-level difference; lower is better

Additionally, a vision-based LLM judge scores each pair on three criteria (the 3 Cs):

1. **Clarity** - symbols, labels, and layout are unambiguous and readable
2. **Completeness** - all components and connections from the ground truth are present
3. **Consistency** - notations, styles, and connectors are used uniformly

Each criterion is rated Meets Expectations / Partially Meets Expectations / Does Not Meet Expectations.

## Submission Format

Predictions are submitted as JSONL with one record per repository:

```json
{
  "instance_id": "octocat_Hello-World",
  "model_name_or_path": "gpt-4o",
  "prediction": "@startuml\n...\n@enduml",
  "generated_image": "results/run_001/generated_images/octocat_Hello-World.png",
  "ground_truth_image": "ground_truth_views/octocat_Hello-World.png"
}
```
