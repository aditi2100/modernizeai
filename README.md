# ModernizeAI

ModernizeAI is a portfolio demonstration of a controlled, evidence-first legacy modernization workflow. It analyzes a bundled Java inventory application, surfaces reproducible static findings, proposes a deliberately small refactoring, verifies its scope, and requires explicit approval before applying it in the demo workspace.

> **Honest demo mode:** the bundled workflow is deterministic and does not call an AI provider, execute imported code, or claim security scans it has not run. Optional AI, repository authorization, isolated code execution, and cloud deployment are not implemented. The dashboard labels demo data and unavailable capabilities.

## Run locally

Requirements: Node.js 20+ and Python 3.11+.

```bash
# Terminal 1 — API (SQLite database is created locally)
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-lock.txt
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend works without the API; set `VITE_API_URL=http://localhost:8000` before starting Vite to use the persistent API. API docs are available at http://localhost:8000/docs.

## Free hosting

**GitHub Pages demo:** [Open ModernizeAI](https://aditi2100.github.io/modernizeai/) — available after Pages is enabled in repository settings.

The static frontend can be published at no cost with GitHub Pages using `.github/workflows/pages.yml`. It runs in clearly marked browser-local demo mode and does not require an API server. The API is intended for local use; this repository does not provision a paid or third-party backend. Hosting providers' free tiers and limits can change, so this project makes no guarantee about external hosting availability.

To publish: in repository **Settings → Pages**, select **GitHub Actions** as the build source. Pushes to `main` trigger the workflow. No secrets or billing account are required.

## What works

- Analyzes the checked-in LegacyInventory Java sources for evidence-backed heuristic findings.
- Browses sample source and displays exact locations and excerpts.
- Produces a bounded refactoring proposal and a unified-style before/after diff.
- Runs deterministic checks on the proposal and requires a human approval action.
- Applies the approved refactoring to a browser-local workspace and records an audit event.
- Exports a Markdown assessment containing measured findings and workflow state.
- Offers a persistent SQLite FastAPI API for project, analysis, proposal, approval, and patch history when run locally.
- Includes separate LegacyInventory and ModernInventory Java examples.

Browser-local demo state is stored in this browser's local storage. Use **Reset demo** to clear it.

## Repository map

```text
frontend/                 React + TypeScript + Vite portfolio dashboard
backend/                  FastAPI + SQLAlchemy + SQLite service
sample-applications/
  legacy-inventory/       Small runnable Java baseline and smoke test
  modern-inventory/       Layered Spring Boot REST example
docs/                     Scope, architecture, and limitations
evaluations/              Reproducible demo evaluation notes
.github/workflows/        GitHub Pages frontend deployment
```

## Verification

```bash
cd frontend && npm ci && npm run build
cd backend && pip install -r requirements-lock.txt && pytest
```

The legacy sample can be compiled with a JDK:

```bash
javac -d /tmp/legacy-inventory-classes sample-applications/legacy-inventory/src/main/java/com/modernizeai/legacy/*.java
java -cp /tmp/legacy-inventory-classes com.modernizeai.legacy.InventoryApp --self-test
```

## Security and known limitations

The demo analyzes only repository content bundled with this project. It does not accept uploads, access GitHub repositories, run user-provided commands, or expose an execution sandbox. Its heuristic findings are not a substitute for Semgrep, Trivy, secret scanning, or a professional security assessment. Do not connect it to sensitive repositories or deploy the development API publicly.

See [docs/architecture.md](docs/architecture.md) and [docs/limitations.md](docs/limitations.md) for implementation boundaries.
See [CONTRIBUTING.md](CONTRIBUTING.md) for local verification and contribution conventions.
