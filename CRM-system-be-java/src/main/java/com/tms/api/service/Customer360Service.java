package com.tms.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.api.dto.customer.Customer360Response;
import com.tms.entity.Customer;
import com.tms.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class Customer360Service {

    private final CustomerRepository customerRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public Customer360Service(
            CustomerRepository customerRepository,
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper) {
        this.customerRepository = customerRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public Customer360Response getProfile(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        List<Customer360Response.OrderSummary> orders = loadOrders(customer);
        List<Customer360Response.InteractionSummary> interactions = loadInteractions(customerId);
        List<Customer360Response.PurchaseExperience> experienceHistory =
                loadPurchaseExperience(customerId);
        Customer360Response.CurrentExperience currentExperience =
                loadCurrentExperience(customerId);

        long paidOrders = orders.stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.status()))
                .count();
        double paidRevenue = orders.stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.status()))
                .mapToDouble(Customer360Response.OrderSummary::amount)
                .sum();

        return new Customer360Response(
                new Customer360Response.CustomerSummary(
                        customer.getId(),
                        customer.getName(),
                        customer.getGender(),
                        customer.getAge(),
                        customer.getUserImage(),
                        customer.getCreatedAt() == null
                                ? null
                                : customer.getCreatedAt().toOffsetDateTime()
                ),
                currentExperience,
                new Customer360Response.CommerceSummary(
                        orders.size(),
                        paidOrders,
                        roundMoney(paidRevenue),
                        paidOrders == 0 ? 0.0 : roundMoney(paidRevenue / paidOrders)
                ),
                orders,
                interactions,
                experienceHistory
        );
    }

    private List<Customer360Response.OrderSummary> loadOrders(Customer customer) {
        return jdbcTemplate.query(
                """
                SELECT so_id, so_code, product_name, COALESCE(amount, 0) AS amount,
                       currency, status, assigned, created_at, paid_at
                FROM so_sales_order
                WHERE customer_id = ?
                   OR (customer_id IS NULL AND LOWER(lead_name) = LOWER(?))
                ORDER BY created_at DESC
                """,
                (rs, rowNum) -> new Customer360Response.OrderSummary(
                        rs.getInt("so_id"),
                        rs.getString("so_code"),
                        rs.getString("product_name"),
                        rs.getDouble("amount"),
                        rs.getString("currency"),
                        rs.getString("status"),
                        rs.getString("assigned"),
                        rs.getObject("created_at", OffsetDateTime.class),
                        rs.getObject("paid_at", OffsetDateTime.class)
                ),
                customer.getId(),
                customer.getName()
        );
    }

    private List<Customer360Response.InteractionSummary> loadInteractions(Integer customerId) {
        return jdbcTemplate.query(
                """
                SELECT si.id, si.interaction_type, si.channel,
                       COALESCE(u.fullname, u.username, 'Chưa gán') AS sale_name,
                       si.outcome, si.notes, si.started_at, si.ended_at
                FROM sales_interactions si
                LEFT JOIN or_user u ON u.user_id = si.staff_id
                WHERE si.customer_id = ?
                ORDER BY si.started_at DESC
                """,
                (rs, rowNum) -> new Customer360Response.InteractionSummary(
                        rs.getLong("id"),
                        rs.getString("interaction_type"),
                        rs.getString("channel"),
                        rs.getString("sale_name"),
                        rs.getString("outcome"),
                        rs.getString("notes"),
                        rs.getObject("started_at", OffsetDateTime.class),
                        rs.getObject("ended_at", OffsetDateTime.class)
                ),
                customerId
        );
    }

    private List<Customer360Response.PurchaseExperience> loadPurchaseExperience(
            Integer customerId) {
        return jdbcTemplate.query(
                """
                SELECT pes.order_id, so.so_code, pes.pre_purchase_state,
                       pes.post_purchase_state, pes.pre_purchase_score,
                       pes.post_purchase_score, pes.experience_delta,
                       COALESCE(pes.confidence, 0) AS confidence,
                       pes.evidence_count, pes.calculated_at
                FROM purchase_experience_summary pes
                JOIN so_sales_order so ON so.so_id = pes.order_id
                WHERE pes.customer_id = ?
                ORDER BY pes.calculated_at DESC
                """,
                (rs, rowNum) -> new Customer360Response.PurchaseExperience(
                        rs.getInt("order_id"),
                        rs.getString("so_code"),
                        rs.getString("pre_purchase_state"),
                        rs.getString("post_purchase_state"),
                        getNullableDouble(rs, "pre_purchase_score"),
                        getNullableDouble(rs, "post_purchase_score"),
                        getNullableDouble(rs, "experience_delta"),
                        rs.getDouble("confidence"),
                        rs.getInt("evidence_count"),
                        rs.getObject("calculated_at", OffsetDateTime.class)
                ),
                customerId
        );
    }

    private Customer360Response.CurrentExperience loadCurrentExperience(Integer customerId) {
        List<Customer360Response.CurrentExperience> events = jdbcTemplate.query(
                """
                SELECT raw_expression, raw_expression_confidence,
                       experience_state, state_confidence,
                       expression_probabilities::text AS probabilities,
                       observed_at, source
                FROM experience_state_events
                WHERE customer_id = ?
                ORDER BY observed_at DESC
                LIMIT 1
                """,
                (rs, rowNum) -> new Customer360Response.CurrentExperience(
                        rs.getString("raw_expression"),
                        rs.getDouble("raw_expression_confidence"),
                        rs.getString("experience_state"),
                        rs.getDouble("state_confidence"),
                        parseProbabilities(rs.getString("probabilities")),
                        rs.getObject("observed_at", OffsetDateTime.class),
                        rs.getString("source")
                ),
                customerId
        );
        if (!events.isEmpty()) {
            return events.get(0);
        }

        List<Customer360Response.CurrentExperience> audits = jdbcTemplate.query(
                """
                SELECT dominant_expression, experience_state, quality_score, created_at
                FROM face_search_audit
                WHERE selected_customer_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (rs, rowNum) -> new Customer360Response.CurrentExperience(
                        rs.getString("dominant_expression"),
                        0.0,
                        rs.getString("experience_state"),
                        rs.getDouble("quality_score"),
                        Collections.emptyMap(),
                        rs.getObject("created_at", OffsetDateTime.class),
                        "FACE_SEARCH"
                ),
                customerId
        );
        return audits.isEmpty() ? null : audits.get(0);
    }

    private Map<String, Double> parseProbabilities(String value) {
        try {
            return objectMapper.readValue(value, new TypeReference<>() {});
        } catch (Exception ignored) {
            return Collections.emptyMap();
        }
    }

    private Double getNullableDouble(ResultSet rs, String column) throws SQLException {
        double value = rs.getDouble(column);
        return rs.wasNull() ? null : value;
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
