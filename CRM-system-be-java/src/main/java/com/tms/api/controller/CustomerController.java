package com.tms.api.controller;

import com.tms.api.dto.customer.Customer360Response;
import com.tms.api.dto.face.ConfirmFaceSearchRequest;
import com.tms.api.dto.face.FaceEnrollmentResponse;
import com.tms.api.dto.face.FaceSearchResponse;
import com.tms.api.service.Customer360Service;
import com.tms.api.service.CustomerEnrollmentService;
import com.tms.api.service.FaceSearchService;
import com.tms.entity.Customer;
import com.tms.repository.CustomerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerEnrollmentService enrollmentService;
    private final FaceSearchService faceSearchService;
    private final Customer360Service customer360Service;
    private final CustomerRepository customerRepository;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<FaceEnrollmentResponse> register(
            @RequestPart("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "user_image", required = false) String userImage) {
        return ResponseEntity.ok(enrollmentService.enroll(file, name, userImage));
    }

    @PostMapping(value = "/identify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<FaceSearchResponse> identify(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "source", defaultValue = "IMPORT") String source) {
        return ResponseEntity.ok(faceSearchService.identify(file, source));
    }

    @PostMapping("/identify/{searchId}/confirm")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> confirmIdentification(
            @PathVariable UUID searchId,
            @Valid @RequestBody ConfirmFaceSearchRequest request) {
        faceSearchService.confirm(searchId, request.customerId());
        return ResponseEntity.ok(Map.of(
                "status", "confirmed",
                "searchId", searchId,
                "customerId", request.customerId()
        ));
    }

    @PostMapping(value = "/checkin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> checkin(@RequestPart("file") MultipartFile file) {
        FaceSearchResponse search = faceSearchService.identify(file, "IMPORT");
        FaceSearchResponse.Candidate best = search.candidates().isEmpty()
                ? null
                : search.candidates().get(0);
        boolean identified = "MATCH".equals(search.status());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("identified", identified);
        response.put("customerId", identified ? best.customerId() : null);
        response.put("name", identified ? best.name() : "Khách mới");
        response.put("gender", identified ? best.gender() : null);
        response.put("age", identified ? best.age() : null);
        response.put("distance", best == null ? null : best.distance());
        response.put("emotion", search.currentExpression().dominant());
        response.put("experienceState", search.currentExperience().state());
        response.put("searchStatus", search.status());
        response.put("message", identified
                ? "Đã nhận diện khách hàng"
                : "Cần xác nhận thủ công hoặc đăng ký khách hàng mới");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{customerId}/profile-360")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Customer360Response> getProfile360(
            @PathVariable Integer customerId) {
        return ResponseEntity.ok(customer360Service.getProfile(customerId));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<Customer> getCustomer(@PathVariable Integer customerId) {
        return customerRepository.findById(customerId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getCustomers() {
        return ResponseEntity.ok(customerRepository.findAll());
    }
}
