package com.tms.api.controller;

import com.tms.entity.Customer;
import com.tms.repository.CustomerRepository;
import com.tms.api.service.FaceRecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final FaceRecognitionService faceRecognitionService;
    private final CustomerRepository customerRepository;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @RequestPart("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "user_image", required = false) String userImage) {
        
        try {
            @SuppressWarnings("rawtypes")
            Map result = faceRecognitionService.registerCustomer(file, name, userImage);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error registering customer: " + e.getMessage());
        }
    }

    @PostMapping(value = "/checkin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> checkin(@RequestPart("file") MultipartFile file) {
        try {
            @SuppressWarnings("rawtypes")
            Map result = faceRecognitionService.checkinCustomer(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error checking in customer: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return ResponseEntity.ok(customers);
    }
}
