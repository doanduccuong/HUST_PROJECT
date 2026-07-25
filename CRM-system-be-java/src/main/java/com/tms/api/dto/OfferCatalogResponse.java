package com.tms.api.dto;

import java.util.List;

public record OfferCatalogResponse(
        long total,
        long active,
        long inactive,
        String revenueFieldMeaning,
        List<OfferItem> offers
) {
    public record OfferItem(
            Integer id,
            String name,
            String status,
            String advertiser,
            String categories,
            String tags,
            String currency,
            String goalType,
            Double goalRevenue,
            Double goalPayout
    ) {}
}
