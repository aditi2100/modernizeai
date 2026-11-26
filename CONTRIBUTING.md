# Contributing

Keep changes small, reproducible, and honest about demo boundaries.

Before opening a change, run:

```bash
cd frontend && npm ci && npm run build
cd backend && .venv/bin/pytest
cd sample-applications/modern-inventory && mvn --batch-mode test
```

For the legacy Java baseline, use the `javac` and `java --self-test` commands in the
root README. Do not execute arbitrary imported source or represent deterministic demo
fixtures as AI-generated output. New endpoints must have focused tests and retain the
approval gate for patch application.
