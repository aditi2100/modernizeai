package com.modernizeai.inventory.product;

public record ProductResponse(
        String sku,
        String name,
        int quantity,
        int reorderPoint,
        long unitPriceCents,
        boolean lowStock) {
    static ProductResponse from(Product product) {
        return new ProductResponse(product.getSku(), product.getName(), product.getQuantity(),
                product.getReorderPoint(), product.getUnitPriceCents(), product.isLowStock());
    }
}
