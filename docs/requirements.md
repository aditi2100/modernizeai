# Product requirements (implemented slice)

## Functional requirements

- FR-01: A user can view the bundled LegacyInventory project and inspect its source.
- FR-02: A user can run deterministic source analysis and review findings with evidence,
  file paths, line numbers, severity, recommendation, and method.
- FR-03: A user can review a narrowly scoped refactoring proposal and verification checks.
- FR-04: A user must explicitly approve the proposal before applying it.
- FR-05: Applying a proposal updates only the demo workspace snapshot and records an event.
- FR-06: A user can export a Markdown assessment of current, measured demo state.
- FR-07: A user can run the optional FastAPI API locally with persistent SQLite state.

## Non-functional requirements

- NFR-01: Static demo hosting requires no API key or paid cloud resource.
- NFR-02: Imported or arbitrary code is never executed by the demo.
- NFR-03: Findings and generated report text distinguish deterministic demo results
  from external scanners and model outputs.
- NFR-04: API patch application is allowlisted, approval-gated, and idempotency-checked.
- NFR-05: The interface provides responsive layouts and keyboard focus indicators.
