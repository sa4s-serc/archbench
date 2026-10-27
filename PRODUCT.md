# Product

## Register

product

## Users

Two audiences, served equally, usually on different pages.

- **Software-architecture researchers** comparing approaches, citing numbers in papers, and checking where a result came from. They read at a desk on a laptop or external monitor, often arriving from a link in a paper. They want density, exact values, metric definitions and provenance one click away.
- **Practitioners** choosing a small open-weight model for an architecture task (ADR writing, traceability, diagram generation, serverless components). They want to know which model is good enough at which size and speed, in plain language, without reading the papers first.

Researchers live on the leaderboard and model pages. Practitioners start on the overview and the Practitioner Guidelines page.

## Product Purpose

ArchBench is a benchmark for LLMs on software-architecture tasks, run by the SA4S group. The site shows two kinds of results that must never be confused:

- **In-house sweep**: the same small open-weight models (about 1–32B, three size tiers) run through one harness on four tasks (adr, traceability, diagram, serverless). These are directly comparable and can be ranked.
- **Paper-reported results**: numbers copied from publications across six tasks. They are context, not competitors, and are never ranked against in-house rows.

Success: a reader can answer "which model is best on this task, at what size and speed, and how do we know?" in under a minute, and can trust every rank because the metric's direction and the result's provenance are always stated.

## Brand Personality

Rigorous, calm, legible. The voice of a careful reviewer: precise, plain, never hyped. Numbers are stated with their units and direction ("higher is better"), uncertainty is shown rather than hidden, and the interface stays quiet so the data carries the page. Restraint is the signal of trust.

## Anti-references

- **HuggingFace Open LLM Leaderboard**: one giant dense table, dozens of toggles, everything visible at once with no hierarchy.
- **Crypto / neon dark dashboards**: glows, glassmorphism, saturated gradients on black.
- **Academic project page templates**: Bootstrap defaults, serif headings by habit, static PNG plots pasted from the paper.
- The current site's own tells: hero-metric strips, uppercase tracked eyebrows over every section, emoji medals and sort icons.

Positive references: artificialanalysis.ai (ranked bars that state metric direction, score-vs-cost scatter with a Pareto line and an "attractive quadrant", colour by model family, a changelog strip) and the arena.ai leaderboard overview (model × task rank matrix).

## Design Principles

1. **Never rank what isn't comparable.** In-house and paper results live in separate groups with a visible provenance badge. Ranks exist only inside a comparable group.
2. **Direction is part of the number.** Every ranked view says which way is better, reads it from the data registry, and handles unbounded or non-finite values honestly (footnoted, never silently dropped).
3. **Show the spread, not just the mean.** Seed variance, instance counts and self-reported flags are visible where they change the reading.
4. **Overview first, detail on demand.** One matrix answers "who is good at what"; drill into a task, then a model. No page shows everything at once.
5. **Data-driven, not hand-wired.** Tasks, metrics and directions come from the results file. Adding a task should need no new page code.

## Accessibility & Inclusion

WCAG 2.2 AA. Text contrast ≥ 4.5:1 (≥ 3:1 for large text) in both themes. Charts are colour-blind safe: categorical palettes validated for CVD, with direct labels or shape as secondary encoding so colour never carries identity alone. Every chart has an equivalent table view and keyboard-reachable marks with focus tooltips. Light and dark are both designed, following the system preference with a manual override. Every animation has a `prefers-reduced-motion` fallback. Layouts work from 360px wide upward with no horizontal page scroll; wide tables scroll inside their own container.
