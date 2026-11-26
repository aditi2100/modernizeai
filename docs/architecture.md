# Architecture and trust boundaries

## Current implementation

The React/Vite application has a deterministic browser-local demo path suitable for
static hosting. Its sample source, analysis rules, proposal, approval state, and
applied workspace snapshot are packaged client-side. State in the static demo is
per-browser local storage; it is not a shared project database.

The optional FastAPI service uses SQLAlchemy and SQLite by default. It stores one
bundled demo project, its source snapshot, findings, workflow flags, and audit events.
It exposes health, project, analyze, approve, and apply endpoints. CORS is restricted
to local development origins. It does not import arbitrary repositories or execute
source code. The API is a local development service, not a production multi-tenant
deployment.

```text
Browser ── React/Vite ── localStorage demo state
    │
    └── optional local HTTP API ── FastAPI ── SQLAlchemy ── SQLite
                                               │
                                     bundled LegacyInventory source
```

## Proposal approval flow

```text
analyze → create evidence findings → review fixed narrow proposal
  → deterministic scope checks → human approval → apply to isolated demo snapshot
```

The API rejects apply requests until approval, rejects repeated application, and only
changes a fixed allowlisted file in the bundled demo snapshot. Browser demo changes
are local to browser storage. Neither route writes to GitHub or the checked-in sample.

## Architecture examples

`sample-applications/legacy-inventory` demonstrates a small console application with
co-located application and domain behavior. `sample-applications/modern-inventory`
is a separate layered Spring Boot reference application. It is not presented as an
AI-generated migration result.
