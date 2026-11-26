package com.modernizeai.legacy;

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
