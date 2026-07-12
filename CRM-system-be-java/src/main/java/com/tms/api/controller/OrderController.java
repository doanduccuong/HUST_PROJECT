package com.tms.api.controller;

import com.tms.entity.SaleOrder;
import com.tms.repository.SaleOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final SaleOrderRepository saleOrderRepository;

    @GetMapping
    public ResponseEntity<List<SaleOrder>> getOrders() {
        return ResponseEntity.ok(saleOrderRepository.findAll());
    }
}
