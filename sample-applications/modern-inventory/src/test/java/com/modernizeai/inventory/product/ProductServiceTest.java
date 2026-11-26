package com.modernizeai.inventory.product;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.mockito.Mockito.mock;

class ProductServiceTest {
    private final ProductRepository repository = mock(ProductRepository.class);
    private final ProductService service = new ProductService(repository);

    @Test
    void createsProductWithLowStockClassification() {
        Product product = new Product("G-200", "Gadget", 3, 5, 2400);
        when(repository.existsById("G-200")).thenReturn(false);
        when(repository.save(org.mockito.ArgumentMatchers.any(Product.class))).thenReturn(product);

        ProductResponse result = service.create(new ProductRequest("G-200", "Gadget", 3, 5, 2400));

        assertTrue(result.lowStock());
        assertEquals(3, result.quantity());
    }

    @Test
    void addsStockAndClearsLowStock() {
        Product product = new Product("W-100", "Widget", 3, 4, 850);
        when(repository.findById("W-100")).thenReturn(Optional.of(product));

        ProductResponse result = service.addStock("W-100", 2);

        assertEquals(5, result.quantity());
        assertFalse(result.lowStock());
        verify(repository).findById("W-100");
    }

    @Test
    void rejectsNonPositiveStockAdjustment() {
        assertThrows(ResponseStatusException.class, () -> service.addStock("W-100", 0));
    }
}
