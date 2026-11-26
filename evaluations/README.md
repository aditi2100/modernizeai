# Evaluation notes

The repository includes executable checks rather than performance claims:

- Legacy Java baseline smoke test: compiles the bundled sources and checks seeded data,
  case-insensitive search, and inventory valuation.
- Python API tests: verify finding persistence and evidence, missing approval blocking,
  successful approval/application, duplicate application rejection, and unavailable
  project rejection.
- Frontend production build: TypeScript type-check followed by Vite bundling.

No human-vs-AI timing study, AI acceptance-rate dataset, cost measurement, security
scanner benchmark, or coverage report has been collected. Do not infer productivity,
coverage, or vulnerability-detection claims from this demo.
