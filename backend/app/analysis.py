from pathlib import Path


REPOSITORY = Path(__file__).resolve().parents[2] / "sample-applications" / "legacy-inventory"


def read_demo_sources() -> dict[str, str]:
    sources: dict[str, str] = {}
    for path in sorted(REPOSITORY.rglob("*")):
        if path.is_file() and path.suffix in {".java", ".md"}:
            sources[path.relative_to(REPOSITORY).as_posix()] = path.read_text(encoding="utf-8")
    return sources


def findings_for(sources: dict[str, str]) -> list[dict]:
    inventory = next((name for name in sources if name.endswith("InventoryApp.java")), None)
    product = next((name for name in sources if name.endswith("Product.java")), None)
    if not inventory or not product:
        raise RuntimeError("Bundled LegacyInventory source files are missing.")

    def line_of(path: str, fragment: str) -> int:
        lines = sources[path].splitlines()
        return next((number for number, line in enumerate(lines, 1) if fragment in line), 1)

    return [
        {
            "id": "hardcoded-db-config",
            "title": "Database configuration is embedded in source",
            "severity": "medium",
            "category": "Configuration",
            "file": inventory,
            "line": line_of(inventory, "DATABASE_URL"),
            "evidence": 'private static final String DATABASE_URL = "jdbc:h2:mem:inventory";',
            "recommendation": "Move connection settings to validated environment-based configuration.",
            "method": "Deterministic source pattern",
        },
        {
            "id": "mixed-responsibilities",
            "title": "Application wiring and inventory behavior share one class",
            "severity": "medium",
            "category": "Modularity",
            "file": inventory,
            "line": line_of(inventory, "public class InventoryApp"),
            "evidence": "InventoryApp owns the entry point, seed data, search, and valuation methods.",
            "recommendation": "Separate the application entry point from inventory services and persistence.",
            "method": "Deterministic structural heuristic",
        },
        {
            "id": "mutable-domain",
            "title": "Domain entity exposes mutable stock without a persistence boundary",
            "severity": "low",
            "category": "Maintainability",
            "file": product,
            "line": line_of(product, "public void addStock"),
            "evidence": "Product.addStock mutates quantity directly; there is no repository abstraction.",
            "recommendation": "Keep stock changes behind a service and persistence transaction.",
            "method": "Deterministic structural heuristic",
        },
        {
            "id": "limited-test-coverage",
            "title": "Only a narrow smoke test is present",
            "severity": "low",
            "category": "Testing",
            "file": inventory,
            "line": line_of(inventory, "private void runSelfTest"),
            "evidence": "runSelfTest checks seeded item count and one quantity only.",
            "recommendation": "Add characterization cases for search, stock validation, and valuation.",
            "method": "Deterministic test inventory",
        },
    ]
