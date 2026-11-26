# LegacyInventory

A compact, console-oriented Java inventory program for a fictional distributor.
It has deterministic in-memory products, basic search, stock validation, low-stock
input data, and inventory valuation. The app wiring and business methods are kept
close together to represent a small legacy codebase.

Compile and run the baseline smoke test from the repository root:

```bash
javac -d /tmp/legacy-inventory-classes sample-applications/legacy-inventory/src/main/java/com/modernizeai/legacy/*.java
java -cp /tmp/legacy-inventory-classes com.modernizeai.legacy.InventoryApp --self-test
```

This self-test is a baseline smoke check, not a complete regression suite.
