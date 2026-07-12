package com.tms.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalMembers;
    private long totalOrders;
    private double totalRevenue;
    private double conversionRate;
    private long callsHandledToday;

    // Live Operation Status Indicators
    private String postgresStatus;
    private String pgvectorStatus;
    private String pythonStatus;
}
