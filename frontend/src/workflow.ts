export type Finding = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  category: string;
  file: string;
  line: number;
  evidence: string;
  recommendation: string;
  method: string;
};

export type DemoState = {
  analyzed: boolean;
  approved: boolean;
  applied: boolean;
  events: { label: string; time: string }[];
};

export const initialState: DemoState = {
  analyzed: false,
  approved: false,
  applied: false,
  events: [],
};

export const sampleFiles: Record<string, string> = {
  "InventoryApp.java": `package com.modernizeai.legacy;

import java.util.ArrayList;
import java.util.List;

// Console entry point and application wiring share one class in the legacy app.
public class InventoryApp {
    private static final String DATABASE_URL = "jdbc:h2:mem:inventory";
    private final List<Product> products = new ArrayList<>();

    public static void main(String[] args) {
        InventoryApp app = new InventoryApp();
        if (args.length > 0 && "--self-test".equals(args[0])) {
            app.runSelfTest();
            return;
        }
        app.seed();
        System.out.println("LegacyInventory ready: " + app.products.size() + " products");
    }

    private void seed() {
        products.add(new Product("W-100", "Widget", 12, 4, 8.50));
        products.add(new Product("G-200", "Gadget", 3, 5, 24.00));
    }

    private void runSelfTest() {
        seed();
        if (products.size() != 2 || products.get(1).getQuantity() != 3) {
            throw new IllegalStateException("Inventory seed regression");
        }
        if (search("widget").size() != 1 || inventoryValue() != 174.0) {
            throw new IllegalStateException("Inventory behavior regression");
        }
        System.out.println("PASS: deterministic inventory baseline");
    }

    public List<Product> search(String query) {
        List<Product> matches = new ArrayList<>();
        for (Product product : products) {
            if (product.getName().toLowerCase().contains(query.toLowerCase())) {
                matches.add(product);
            }
        }
        return matches;
    }

    public double inventoryValue() {
        double total = 0;
        for (Product product : products) {
            total += product.getQuantity() * product.getUnitPrice();
        }
        return total;
    }

    public String databaseUrl() {
        return DATABASE_URL;
    }
}
`,
  "Product.java": `package com.modernizeai.legacy;

public class Product {
    private final String sku;
    private final String name;
    private int quantity;
    private final int reorderPoint;
    private final double unitPrice;

    public Product(String sku, String name, int quantity, int reorderPoint, double unitPrice) {
        if (sku == null || sku.isBlank() || name == null || name.isBlank()) {
            throw new IllegalArgumentException("SKU and name are required");
        }
        if (quantity < 0 || reorderPoint < 0 || unitPrice < 0) {
            throw new IllegalArgumentException("Inventory values cannot be negative");
        }
        this.sku = sku;
        this.name = name;
        this.quantity = quantity;
        this.reorderPoint = reorderPoint;
        this.unitPrice = unitPrice;
    }

    public void addStock(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("Stock increase must be positive");
        quantity += amount;
    }

    public String getSku() { return sku; }
    public String getName() { return name; }
    public int getQuantity() { return quantity; }
    public int getReorderPoint() { return reorderPoint; }
    public double getUnitPrice() { return unitPrice; }
}
`,
  "README.md": `# LegacyInventory

A compact, console-oriented Java inventory program for a fictional distributor.
Compile the sources with a JDK and run InventoryApp. The self-test is a deterministic
smoke check; it is not a comprehensive automated test suite.

The original application keeps inventory operations and command-line wiring close
together. It uses in-memory sample data in this portfolio demo.
`,
};

function lineOf(source: string, snippet: string): number {
  const index = source.indexOf(snippet);
  return index < 0 ? 1 : source.slice(0, index).split("\n").length;
}

export function analyzeSample(): Finding[] {
  const app = sampleFiles["InventoryApp.java"];
  const product = sampleFiles["Product.java"];
  return [
    {
      id: "hardcoded-db-config",
      title: "Database configuration is embedded in source",
      severity: "medium",
      category: "Configuration",
      file: "InventoryApp.java",
      line: lineOf(app, 'private static final String DATABASE_URL'),
      evidence: 'private static final String DATABASE_URL = "jdbc:h2:mem:inventory";',
      recommendation: "Move connection settings to validated environment-based configuration.",
      method: "Deterministic source pattern",
    },
    {
      id: "mixed-responsibilities",
      title: "Application wiring and inventory behavior share one class",
      severity: "medium",
      category: "Modularity",
      file: "InventoryApp.java",
      line: lineOf(app, "public class InventoryApp"),
      evidence: "InventoryApp owns the entry point, seed data, search, and valuation methods.",
      recommendation: "Separate the application entry point from inventory services and persistence.",
      method: "Deterministic structural heuristic",
    },
    {
      id: "mutable-domain",
      title: "Domain entity exposes mutable stock without a persistence boundary",
      severity: "low",
      category: "Maintainability",
      file: "Product.java",
      line: lineOf(product, "public void addStock"),
      evidence: "Product.addStock mutates quantity directly; there is no repository abstraction.",
      recommendation: "Keep stock changes behind a service and persistence transaction.",
      method: "Deterministic structural heuristic",
    },
    {
      id: "limited-test-coverage",
      title: "Only a narrow smoke test is present",
      severity: "low",
      category: "Testing",
      file: "InventoryApp.java",
      line: lineOf(app, "private void runSelfTest"),
      evidence: "runSelfTest checks seeded item count and one quantity only.",
      recommendation: "Add characterization cases for search, stock validation, and valuation.",
      method: "Deterministic test inventory",
    },
  ];
}

export const proposal = {
  title: "Extract low-stock classification into Product",
  summary:
    "Add a small domain query so callers can ask whether a product is below its reorder point. This is a bounded change to one file and preserves current stock and valuation behavior.",
  file: "Product.java",
  before: `    public int getQuantity() { return quantity; }\n    public int getReorderPoint() { return reorderPoint; }`,
  after: `    public int getQuantity() { return quantity; }\n\n    public boolean isLowStock() {\n        return quantity <= reorderPoint;\n    }\n\n    public int getReorderPoint() { return reorderPoint; }`,
  checks: [
    "Patch modifies one allowlisted sample file",
    "New method is a pure query with no state changes",
    "Boundary uses <= to include the reorder point",
    "Existing stock mutation and valuation source remain unchanged",
  ],
};

export function currentProductSource(applied: boolean) {
  const source = sampleFiles["Product.java"];
  return applied ? source.replace(proposal.before, proposal.after) : source;
}

export function localTimestamp() {
  return new Date().toLocaleString();
}
