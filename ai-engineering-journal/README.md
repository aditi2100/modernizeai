# AI Engineering Journal

This journal records work performed in the current GitHub Copilot coding session. It
does not claim that Claude, OpenAI APIs, or autonomous agent workflows were used.

## 2026-11-26 — Runnable zero-cost-hosting demo

- **Task:** Build a portfolio-oriented, evidence-based modernization demo and avoid
  paid hosting. The user emphasized: “build this without any cost to me for hosting it”.
- **AI tool:** GitHub Copilot (this coding session).
- **Generated output:** React/TypeScript workbench, deterministic source findings,
  FastAPI/SQLAlchemy SQLite API, approval-gated sample patch workflow, Java legacy and
  Spring Boot reference applications, local Compose setup, CI and GitHub Pages workflows,
  and scope/security documentation.
- **Limitations identified:** The original request described a much broader enterprise
  platform. Repository OAuth/import, AI-provider calls, LangGraph orchestration, safe
  arbitrary-code execution, external security scanning, RAG, Azure provisioning, and a
  real public backend are not included. Demo findings are heuristics, not scanner output.
- **Corrections during development:** Fixed TypeScript unused-symbol/type-definition
  errors, pytest module discovery, local API CORS, Compose API port publication, and
  removed a remote font dependency after the offline browser check.
- **Verification:** Frontend production build; six FastAPI tests; legacy Java compile
  and smoke check; three Spring Boot service tests; Docker Compose build and local
  readiness check; browser-driven analysis → approval → patch application.
- **Time spent:** Not measured by the tool session.
- **Human review status:** Pending user review; no independent human review is claimed.
- **Outcome:** The static browser demo and local API workflow are implemented. GitHub
  Pages publication is configured as a free-tier target; availability depends on
  enabling Pages for this repository.
