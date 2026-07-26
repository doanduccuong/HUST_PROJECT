package com.tms.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/experience")
@RequiredArgsConstructor
public class ExperienceLogsController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/journeys")
    public ResponseEntity<List<Map<String, Object>>> getJourneys(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        String sql = """
            SELECT es.customer_id, c.name as customer_name, c.user_image as customer_image,
                   es.started_at::date as journey_date,
                   MIN(es.started_at) as arrival_time,
                   MAX(es.ended_at) as departure_time
            FROM experience_sessions es
            LEFT JOIN customers c ON c.id = es.customer_id
            WHERE es.customer_id IS NOT NULL
            """;
        List<Object> params = new ArrayList<>();
        if (date != null && !date.isEmpty()) {
            sql += " AND es.started_at::date = ?::date ";
            params.add(date);
        }
        if (search != null && !search.isEmpty()) {
            sql += " AND LOWER(c.name) LIKE ? ";
            params.add("%" + search.toLowerCase() + "%");
        }
        sql += " GROUP BY es.customer_id, c.name, c.user_image, es.started_at::date ";
        sql += " ORDER BY MIN(es.started_at) DESC LIMIT ? ";
        params.add(limit);

        List<Map<String, Object>> journeys = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new LinkedHashMap<>();
            int customerId = rs.getInt("customer_id");
            java.sql.Date jDate = rs.getDate("journey_date");
            map.put("customerId", customerId);
            map.put("customerName", rs.getString("customer_name"));
            map.put("customerImage", rs.getString("customer_image"));
            map.put("journeyDate", jDate.toString());
            map.put("arrivalTime", rs.getTimestamp("arrival_time"));
            map.put("departureTime", rs.getTimestamp("departure_time"));

            // Fetch sequential steps of this customer on this day
            String stepsSql = """
                SELECT es.id, es.camera_id, es.zone, es.local_track_id, es.started_at, es.ended_at, es.data_origin,
                       (SELECT experience_state FROM experience_state_events ese 
                        WHERE ese.session_id = es.id 
                        ORDER BY ese.observed_at ASC LIMIT 1) as experience_state
                FROM experience_sessions es
                WHERE es.customer_id = ? AND es.started_at::date = ?::date
                ORDER BY es.started_at ASC
                """;
            List<Map<String, Object>> steps = jdbcTemplate.query(stepsSql, (stepRs, stepRowNum) -> {
                Map<String, Object> stepMap = new LinkedHashMap<>();
                stepMap.put("id", stepRs.getObject("id"));
                stepMap.put("cameraId", stepRs.getString("camera_id"));
                stepMap.put("zone", stepRs.getString("zone"));
                stepMap.put("localTrackId", stepRs.getString("local_track_id"));
                stepMap.put("startedAt", stepRs.getTimestamp("started_at"));
                stepMap.put("endedAt", stepRs.getTimestamp("ended_at"));
                stepMap.put("dataOrigin", stepRs.getString("data_origin"));
                stepMap.put("experienceState", stepRs.getString("experience_state"));
                return stepMap;
            }, customerId, jDate);

            map.put("steps", steps);
            return map;
        }, params.toArray());

        return ResponseEntity.ok(journeys);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getSessions(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "zone", required = false) String zone,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        String sql = """
            SELECT es.id, es.camera_id, es.zone, es.local_track_id, es.started_at, es.ended_at, es.data_origin,
                   c.name as customer_name, c.user_image as customer_image
            FROM experience_sessions es
            LEFT JOIN customers c ON c.id = es.customer_id
            WHERE 1=1
            """;
        List<Object> params = new ArrayList<>();
        if (zone != null && !zone.isEmpty() && !zone.equalsIgnoreCase("ALL")) {
            sql += " AND UPPER(es.zone) = ? ";
            params.add(zone.toUpperCase());
        }
        if (date != null && !date.isEmpty()) {
            sql += " AND es.started_at::date = ?::date ";
            params.add(date);
        }
        if (search != null && !search.isEmpty()) {
            sql += " AND (LOWER(c.name) LIKE ? OR LOWER(es.local_track_id) LIKE ?) ";
            params.add("%" + search.toLowerCase() + "%");
            params.add("%" + search.toLowerCase() + "%");
        }
        sql += " ORDER BY es.started_at DESC LIMIT ? ";
        params.add(limit);

        List<Map<String, Object>> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", rs.getObject("id"));
            map.put("cameraId", rs.getString("camera_id"));
            map.put("zone", rs.getString("zone"));
            map.put("localTrackId", rs.getString("local_track_id"));
            map.put("startedAt", rs.getTimestamp("started_at"));
            map.put("endedAt", rs.getTimestamp("ended_at"));
            map.put("dataOrigin", rs.getString("data_origin"));
            map.put("customerName", rs.getString("customer_name"));
            map.put("customerImage", rs.getString("customer_image"));
            return map;
        }, params.toArray());

        return ResponseEntity.ok(list);
    }

    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getEvents(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "zone", required = false) String zone,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        String sql = """
            SELECT ese.id, ese.session_id, ese.camera_id, ese.zone, ese.observed_at,
                   ese.raw_expression, ese.raw_expression_confidence,
                   ese.experience_state, ese.state_confidence, ese.expression_probabilities,
                   c.name as customer_name, c.user_image as customer_image
            FROM experience_state_events ese
            LEFT JOIN customers c ON c.id = ese.customer_id
            WHERE 1=1
            """;
        List<Object> params = new ArrayList<>();
        if (zone != null && !zone.isEmpty() && !zone.equalsIgnoreCase("ALL")) {
            sql += " AND UPPER(ese.zone) = ? ";
            params.add(zone.toUpperCase());
        }
        if (state != null && !state.isEmpty() && !state.equalsIgnoreCase("ALL")) {
            sql += " AND UPPER(ese.experience_state) = ? ";
            params.add(state.toUpperCase());
        }
        if (date != null && !date.isEmpty()) {
            sql += " AND ese.observed_at::date = ?::date ";
            params.add(date);
        }
        if (search != null && !search.isEmpty()) {
            sql += " AND LOWER(c.name) LIKE ? ";
            params.add("%" + search.toLowerCase() + "%");
        }
        sql += " ORDER BY ese.observed_at DESC LIMIT ? ";
        params.add(limit);

        List<Map<String, Object>> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", rs.getLong("id"));
            map.put("sessionId", rs.getObject("session_id"));
            map.put("cameraId", rs.getString("camera_id"));
            map.put("zone", rs.getString("zone"));
            map.put("observedAt", rs.getTimestamp("observed_at"));
            map.put("rawExpression", rs.getString("raw_expression"));
            map.put("rawExpressionConfidence", rs.getDouble("raw_expression_confidence"));
            map.put("experienceState", rs.getString("experience_state"));
            map.put("stateConfidence", rs.getDouble("state_confidence"));
            map.put("expressionProbabilities", rs.getString("expression_probabilities"));
            map.put("customerName", rs.getString("customer_name"));
            map.put("customerImage", rs.getString("customer_image"));
            return map;
        }, params.toArray());

        return ResponseEntity.ok(list);
    }

    @GetMapping("/purchase-summaries")
    public ResponseEntity<List<Map<String, Object>>> getPurchaseSummaries(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        String sql = """
            SELECT pes.order_id, pes.pre_purchase_state, pes.post_purchase_state,
                   pes.pre_purchase_score, pes.post_purchase_score, pes.experience_delta,
                   pes.confidence, pes.evidence_count, pes.calculated_at,
                   c.name as customer_name, c.user_image as customer_image,
                   so.so_code as order_code
            FROM purchase_experience_summary pes
            LEFT JOIN customers c ON c.id = pes.customer_id
            LEFT JOIN so_sales_order so ON so.so_id = pes.order_id
            WHERE 1=1
            """;
        List<Object> params = new ArrayList<>();
        if (date != null && !date.isEmpty()) {
            sql += " AND pes.calculated_at::date = ?::date ";
            params.add(date);
        }
        if (search != null && !search.isEmpty()) {
            sql += " AND (LOWER(c.name) LIKE ? OR LOWER(so.so_code) LIKE ?) ";
            params.add("%" + search.toLowerCase() + "%");
            params.add("%" + search.toLowerCase() + "%");
        }
        sql += " ORDER BY pes.calculated_at DESC LIMIT ? ";
        params.add(limit);

        List<Map<String, Object>> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("orderId", rs.getInt("order_id"));
            map.put("prePurchaseState", rs.getString("pre_purchase_state"));
            map.put("postPurchaseState", rs.getString("post_purchase_state"));
            map.put("prePurchaseScore", rs.getDouble("pre_purchase_score"));
            map.put("postPurchaseScore", rs.getDouble("post_purchase_score"));
            map.put("experienceDelta", rs.getDouble("experience_delta"));
            map.put("confidence", rs.getDouble("confidence"));
            map.put("evidenceCount", rs.getInt("evidence_count"));
            map.put("calculatedAt", rs.getTimestamp("calculated_at"));
            map.put("customerName", rs.getString("customer_name"));
            map.put("customerImage", rs.getString("customer_image"));
            map.put("orderCode", rs.getString("order_code"));
            return map;
        }, params.toArray());

        return ResponseEntity.ok(list);
    }
}
