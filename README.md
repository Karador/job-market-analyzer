# job-market-analyzer

A CLI-based tool for collecting, normalizing and analyzing job vacancies from multiple platforms.

The project focuses on reducing noise and cognitive load when browsing job listings by automatically filtering, scoring and aggregating vacancy data.

---

## Purpose

This tool was built as a **personal research and analysis utility**, not as a production service or job board.

Its main goals are:
- to analyze real job market data
- to identify recurring technologies and role patterns
- to reduce manual browsing of low-signal vacancies
- to support manual decision-making with structured output

The final review of vacancies is always done manually.

---

## What the tool does

- Fetches job vacancies from multiple sources (HH, Habr Career, RemoteJob)
- Normalizes heterogeneous vacancy data into a unified structure
- Filters vacancies using simple gate rules
- Scores vacancies using configurable heuristics
- Produces explainable scoring results
- Aggregates keyword and penalty statistics
- Stores processed data locally for repeated analysis

---

## How it is used

The primary interaction model is **read-only console output**.

Commands like `top` and `fresh` print a small list of high-signal vacancies in the following format:

```
<score> <vacancy title>

<link>
```

Example:

0.6 Frontend Developer (Pug, SCSS, JS, Gulp) (remote)
https://remote-job.ru/vacancy/show/1353107/frontend-razrabotchik-pug-scss-js-gulp

The intention is to:

1. Automatically reduce the number of vacancies to review

2. Manually open and evaluate selected listings

## Processing pipeline

At a high level, the data flow looks like this:

raw vacancies
  → normalization
  → gate filtering
  → scoring
  → explanation
  → local storage

Each step has a single responsibility and can be adjusted independently.

### Normalized vacancy structure (simplified)

Each processed vacancy contains:

- **vacancy**
  - basic info (title, company, salary, source)
  - extracted technologies and tags

- **scores**
  - group scores
  - entry-level signals
  - penalties

- **explain**
  - final verdict
  - scoring contributions
  - matched technologies

- **meta**
  - processing metadata

# Minimal example:

```json
{
  "vacancy": {
    "title": "Fullstack React + Node.js",
    "tech": {
      "tags": ["javascript", "nodejs", "react.web"]
    }
  },
  "scores": {
    "total": 0.6
  },
  "explain": {
    "verdict": "maybe",
    "notes": ["Strong web profile"]
  }
}
```

## Available scripts

All commands are executed via `npm run`.

# Development mode

`npm run dev`

Runs the tool in development mode using `nodemon`.

# Fetch all vacancies

`npm run fetch`

Fetches and stores vacancies from all configured sources.

# Fetch fresh vacancies

`npm run fresh`

Fetches recent vacancies and prints the top results.

# Analyze stored data

`npm run analyze`

Generates aggregated statistics and keyword frequency reports based on cached data.

# Show top vacancies (default mode)

`npm run top`

Prints the top scored vacancies from local storage.

This is the default mode if no CLI argument is provided.

## Entry point

The main entry point is `src/index.js`.

Execution mode is determined by a CLI argument:

```bash
node src/index.js fetch
node src/index.js analyze
node src/index.js top
```

If no mode is specified, the tool defaults to `top`.

## Data storage

- Processed vacancies are stored locally in `jsonl` format
- Seen vacancies are tracked via `seen.json`
- This allows repeated analysis without refetching
- Some commands may update `seen.json` to avoid re-reviewing the same vacancies


## Tech stack

- Node.js (tested with v22.14.0)
- Axios
- Cheerio
- Plain JavaScript (CommonJS)
- Local file-based storage (jsonl)

## Notes

- This project was developed as a personal research tool
- Heuristics and scoring rules are intentionally simple and explainable
- The architecture evolved incrementally during development
- The project prioritizes clarity and debuggability over completeness
