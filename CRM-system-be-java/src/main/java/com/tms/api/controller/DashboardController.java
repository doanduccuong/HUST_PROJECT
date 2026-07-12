package com.tms.api.controller;

import com.tms.api.dto.DashboardStatsResponse;
import com.tms.repository.CdrRepository;
import com.tms.repository.CustomerRepository;
import com.tms.repository.SaleOrderRepository;
import com.tms.api.service.FaceRecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final CdrRepository cdrRepository;
    private final FaceRecognitionService faceRecognitionService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        long totalMembers = customerRepository.count();
        long totalOrders = saleOrderRepository.count();
        double totalRevenue = saleOrderRepository.sumTotalRevenue();
        long totalCalls = cdrRepository.count();
        
        double conversionRate = totalMembers > 0 
                ? Math.round((totalOrders * 100.0 / totalMembers) * 100.0) / 100.0 
                : 0.0;

        // Dynamic System Status Checks
        String postgresStatus = "Active (Port 5433)";
        String pgvectorStatus = customerRepository.isPgVectorInstalled() ? "Loaded" : "Not Loaded";
        String pythonStatus = faceRecognitionService.checkPythonHealth() ? "Active" : "Pending Java Connection";

        return ResponseEntity.ok(DashboardStatsResponse.builder()
                .totalMembers(totalMembers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .conversionRate(conversionRate)
                .callsHandledToday(totalCalls)
                .postgresStatus(postgresStatus)
                .pgvectorStatus(pgvectorStatus)
                .pythonStatus(pythonStatus)
                .build());
    }
}
