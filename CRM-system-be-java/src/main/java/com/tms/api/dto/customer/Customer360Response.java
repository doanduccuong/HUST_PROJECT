package com.tms.api.dto.customer;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record Customer360Response(
        CustomerSummary customer,
        CurrentExperience currentExperience,
        CommerceSummary commerce,
        List<OrderSummary> orders,
        List<InteractionSummary> salesInteractions,
        List<PurchaseExperience> purchaseExperienceHistory
) {
    public record CustomerSummary(
            Integer id,
            String name,
            String gender,
            Integer age,
            String avatarUrl,
            OffsetDateTime createdAt
    ) {}

    public record CurrentExperience(
            String rawExpression,
            double expressionConfidence,
            String experienceState,
            double stateConfidence,
            Map<String, Double> expressionProbabilities,
            OffsetDateTime observedAt,
            String source
    ) {}

    public record CommerceSummary(
            long orderCount,
            long paidOrderCount,
            double paidRevenue,
            double averagePaidOrderValue
    ) {}

    public record OrderSummary(
            Integer id,
            String code,
            String productName,
            double amount,
            String currency,
            String status,
            String assignedSale,
            OffsetDateTime createdAt,
            OffsetDateTime paidAt
    ) {}

    public record InteractionSummary(
            Long id,
            String interactionType,
            String channel,
            String saleName,
            String outcome,
            String notes,
            OffsetDateTime startedAt,
            OffsetDateTime endedAt
    ) {}

    public record PurchaseExperience(
            Integer orderId,
            String orderCode,
            String prePurchaseState,
            String postPurchaseState,
            Double prePurchaseScore,
            Double postPurchaseScore,
            Double delta,
            double confidence,
            int evidenceCount,
            OffsetDateTime calculatedAt
    ) {}
}
