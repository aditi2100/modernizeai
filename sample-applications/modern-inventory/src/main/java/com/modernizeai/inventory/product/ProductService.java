package com.modernizeai.inventory.product;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> find(String query) {
        List<Product> products = query == null || query.isBlank()
                ? repository.findAll()
                : repository.findByNameContainingIgnoreCase(query.trim());
        return products.stream().map(ProductResponse::from).toList();
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (repository.existsById(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
        }
        Product saved = repository.save(new Product(request.sku(), request.name(), request.quantity(),
                request.reorderPoint(), request.unitPriceCents()));
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse addStock(String sku, int amount) {
        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock increase must be positive");
        }
        Product product = repository.findById(sku)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        try {
            product.addStock(amount);
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock quantity exceeds supported range");
        }
        return ProductResponse.from(product);
    }
}
