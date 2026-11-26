# Scope and known limitations

ModernizeAI is a small, runnable portfolio demonstration, not the full enterprise
platform described in the original product vision.

Implemented: bundled Java sample inspection; heuristic evidence findings; a fixed,
narrow patch proposal; deterministic scope checks; approval-gated browser and API
application; local SQLite persistence; Markdown export; sample legacy and layered
Spring Boot applications; static GitHub Pages deployment workflow.

Not implemented: GitHub OAuth/App integration, ZIP import, tenant/user management,
PostgreSQL/pgvector RAG, LangGraph or AI provider calls, generated tests or patch
authoring, process/container sandbox for arbitrary code, Semgrep/Trivy scans, branch
or pull request creation, full rollback, coverage instrumentation, Azure Terraform,
cloud deployment, recorded AI engineering journal, or end-to-end browser tests.

The dashboard deliberately reports unavailable measurements and scanner status
instead of substituting fabricated metrics. Free static hosting does not host the
Python API. The full API runs locally. No billable infrastructure is provisioned.
