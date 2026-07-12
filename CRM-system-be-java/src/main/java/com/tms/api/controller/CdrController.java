package com.tms.api.controller;

import com.tms.entity.Cdr;
import com.tms.repository.CdrRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/cdrs")
@RequiredArgsConstructor
public class CdrController {

    private final CdrRepository cdrRepository;

    @GetMapping
    public ResponseEntity<List<Cdr>> getCdrs() {
        return ResponseEntity.ok(cdrRepository.findAll());
    }
}
