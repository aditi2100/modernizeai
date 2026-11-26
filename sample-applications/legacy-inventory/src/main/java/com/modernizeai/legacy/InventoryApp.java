package com.modernizeai.legacy;

import java.util.ArrayList;
import java.util.List;

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
