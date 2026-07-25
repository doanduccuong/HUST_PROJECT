package com.tms.api.controller;

import com.tms.api.dto.OfferCatalogResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/offers")
public class OfferController {

    private final JdbcTemplate jdbcTemplate;

    public OfferController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<OfferCatalogResponse> getOffers(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "") String search) {
        int safeLimit = Math.max(1, Math.min(limit, 1000));
        String searchPattern = "%" + search.trim().toLowerCase() + "%";

        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM offers", Long.class);
        Long active = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM offers WHERE UPPER(status) = 'ACTIVE'",
                Long.class
        );
        Long inactive = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM offers WHERE UPPER(status) = 'INACTIVE'",
                Long.class
        );
        List<OfferCatalogResponse.OfferItem> offers = jdbcTemplate.query(
                """
                SELECT offer_id, offer_name, status, advertiser_name, categories, tags,
                       currency, goal_type_1, goal_revenue_1, goal_payout_1
                FROM offers
                WHERE ? = '%%'
                   OR LOWER(offer_name) LIKE ?
                   OR LOWER(COALESCE(advertiser_name, '')) LIKE ?
                   OR LOWER(COALESCE(tags, '')) LIKE ?
                ORDER BY CASE WHEN UPPER(status) = 'ACTIVE' THEN 0 ELSE 1 END, offer_id DESC
                LIMIT ?
                """,
                (rs, rowNum) -> {
                    var goalRevenue = rs.getBigDecimal("goal_revenue_1");
                    var goalPayout = rs.getBigDecimal("goal_payout_1");
                    return new OfferCatalogResponse.OfferItem(
                            rs.getInt("offer_id"),
                            rs.getString("offer_name"),
                            rs.getString("status"),
                            rs.getString("advertiser_name"),
                            rs.getString("categories"),
                            rs.getString("tags"),
                            rs.getString("currency"),
                            rs.getString("goal_type_1"),
                            goalRevenue == null ? null : goalRevenue.doubleValue(),
                            goalPayout == null ? null : goalPayout.doubleValue()
                    );
                },
                searchPattern,
                searchPattern,
                searchPattern,
                searchPattern,
                safeLimit
        );

        return ResponseEntity.ok(new OfferCatalogResponse(
                total == null ? 0 : total,
                active == null ? 0 : active,
                inactive == null ? 0 : inactive,
                "Revenue/Payout là cấu hình goal của offer, không phải doanh thu bán hàng.",
                offers
        ));
    }
}
