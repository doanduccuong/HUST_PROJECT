package com.tms.api.controller;

import com.tms.entity.PDProduct;
import com.tms.repository.PDProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final PDProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<PDProduct>> getProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PDProduct> updateProduct(@PathVariable("id") Integer id, @RequestBody PDProduct productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setCategory(productDetails.getCategory());
            product.setCode(productDetails.getCode());
            product.setPrice(productDetails.getPrice());
            product.setDscr(productDetails.getDscr());
            product.setStatus(productDetails.getStatus());
            PDProduct updated = productRepository.save(product);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
