package com.tms.api.dto;

import com.tms.api.dto.dashboard.MySaleTunnelDto;
import com.tms.api.dto.dashboard.StaticLeadDto;
import com.tms.api.dto.dashboard.TotalCallDto;
import com.tms.api.dto.dashboard.PerfomanceCompareDto;
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

    // Redesigned dashboard metrics
    private MySaleTunnelDto mySale;
    private StaticLeadDto lead;
    private TotalCallDto totalCall;
    private PerfomanceCompareDto compare;
}

