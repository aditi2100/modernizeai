package com.modernizeai.inventory.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank @Size(max = 40) String sku,
        @NotBlank @Size(max = 160) String name,
        @Min(0) int quantity,
        @Min(0) int reorderPoint,
        @Min(0) long unitPriceCents) {}
