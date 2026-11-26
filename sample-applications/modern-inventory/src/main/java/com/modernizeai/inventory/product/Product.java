package com.modernizeai.inventory.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @Column(length = 40, nullable = false)
    private String sku;

    @Column(length = 160, nullable = false)
    private String name;

    private int quantity;
    private int reorderPoint;
    private long unitPriceCents;

    protected Product() {}

    public Product(String sku, String name, int quantity, int reorderPoint, long unitPriceCents) {
        this.sku = sku;
        this.name = name;
        this.quantity = quantity;
        this.reorderPoint = reorderPoint;
        this.unitPriceCents = unitPriceCents;
    }

    public String getSku() { return sku; }
    public String getName() { return name; }
    public int getQuantity() { return quantity; }
    public int getReorderPoint() { return reorderPoint; }
    public long getUnitPriceCents() { return unitPriceCents; }
    public boolean isLowStock() { return quantity <= reorderPoint; }
    public void addStock(int amount) { quantity = Math.addExact(quantity, amount); }
}
