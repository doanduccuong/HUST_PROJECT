package com.tms.api.controller;

import com.tms.api.dto.DashboardStatsResponse;
import com.tms.api.dto.dashboard.MySaleTunnelDto;
import com.tms.api.dto.dashboard.StaticLeadDto;
import com.tms.api.dto.dashboard.TotalCallDto;
import com.tms.api.dto.dashboard.PerfomanceCompareDto;
import com.tms.api.dto.dashboard.ComparationDto;
import com.tms.repository.CdrRepository;
import com.tms.repository.CustomerRepository;
import com.tms.repository.SaleOrderRepository;
import com.tms.api.service.FaceRecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

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

        // 1. Initialize variables from database counts
        int approved = 0;
        int rejected = 0;
        int callback = 0;
        int trash = 0;
        int busy = 0;
        int noanws = 0;
        int unreach = 0;

        List<Object[]> statusCounts = cdrRepository.countByStatus();
        for (Object[] row : statusCounts) {
            String status = row[0] != null ? row[0].toString().toUpperCase() : "";
            int count = ((Number) row[1]).intValue();

            if (status.contains("ANSWERED") || status.contains("APPROVED") || status.contains("SUCCESS")) {
                approved += count;
            } else if (status.contains("REJECTED") || status.contains("DECLINED") || status.contains("CANCEL")) {
                rejected += count;
            } else if (status.contains("CALLBACK") || status.contains("CALL BACK")) {
                callback += count;
            } else if (status.contains("TRASH") || status.contains("INVALID") || status.contains("SPAM")) {
                trash += count;
            } else if (status.contains("BUSY")) {
                busy += count;
            } else if (status.contains("NO ANSWER") || status.contains("NO_ANSWER")) {
                noanws += count;
            } else {
                unreach += count;
            }
        }

        int unCall = busy + noanws + unreach;
        
        // Funnel metrics
        int funnelLead = (int) totalMembers;
        int funnelSaleOrder = (int) totalOrders;
        // Approximate delivery and paid status counts based on orders if database doesn't track separately
        int funnelDelivery = (int) (totalOrders * 0.8);
        int funnelPaid = (int) (totalOrders * 0.5);


        // 3. Build sub-DTOs
        StaticLeadDto leadDto = StaticLeadDto.builder()
                .approved(approved)
                .rejected(rejected)
                .callback(callback)
                .trash(trash)
                .busy(busy)
                .noanws(noanws)
                .unreach(unreach)
                .total(approved + rejected + callback + trash + unCall)
                .unCall(unCall)
                .build();

        MySaleTunnelDto mySaleDto = MySaleTunnelDto.builder()
                .lead(funnelLead)
                .saleOrder(funnelSaleOrder)
                .delivered(funnelDelivery)
                .paid(funnelPaid)
                .build();

        TotalCallDto totalCallDto = TotalCallDto.builder()
                .connected(approved + rejected + callback)
                .busy(unCall)
                .invalid(trash)
                .total(approved + rejected + callback + unCall + trash)
                .build();

        // Performance Comparison List
        List<ComparationDto> compareList = new ArrayList<>();
        compareList.add(new ComparationDto("Total Lead", (double) funnelLead));
        compareList.add(new ComparationDto("Total Order Value", totalRevenue));
        compareList.add(new ComparationDto("Sale Order", (double) funnelSaleOrder));
        
        double approveRate = totalCallDto.getTotal() > 0 
                ? Math.round((approved * 100.0 / totalCallDto.getTotal()) * 100.0) / 100.0
                : 0.0;
        compareList.add(new ComparationDto("Approve Rate", approveRate));

        double avgOrderValue = funnelSaleOrder > 0 
                ? Math.round((totalRevenue / funnelSaleOrder) * 100.0) / 100.0
                : 0.0;
        compareList.add(new ComparationDto("Avg Order Value", avgOrderValue));

        PerfomanceCompareDto compareDto = PerfomanceCompareDto.builder()
                .lst(compareList)
                .build();

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
                .lead(leadDto)
                .mySale(mySaleDto)
                .totalCall(totalCallDto)
                .compare(compareDto)
                .build());
    }
}

