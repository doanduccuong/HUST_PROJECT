package com.tms.api.dto.dashboard;

import java.util.List;

public record SalesPerformanceResponse(
        double paidRevenue,
        long paidOrders,
        long totalOrders,
        double paidConversionRate,
        List<SalePerformance> sales
) {
    public record SalePerformance(
            Integer staffId,
            String name,
            String username,
            String specialty,
            long orderCount,
            long paidOrderCount,
            double paidRevenue,
            double averagePaidOrderValue,
            double paidConversionRate,
            long interactionCount,
            long callsHandled,
            Double averageExperienceDelta
    ) {}
}
