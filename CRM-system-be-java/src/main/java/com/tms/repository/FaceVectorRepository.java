package com.tms.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.api.dto.face.FaceAnalysisResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public class FaceVectorRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public FaceVectorRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public record CandidateRow(
            Integer customerId,
            String name,
            String gender,
            Integer age,
            String userImage,
            double distance
    ) {}

    public List<CandidateRow> findNearest(
            FaceAnalysisResponse.Embeddings embeddings,
            int limit) {
        String sql = """
                SELECT c.id, c.name, c.gender, c.age, c.user_image,
                       (0.5 * (upper_emb.face_vector <=> CAST(? AS vector)) +
                        0.3 * (mid_emb.face_vector <=> CAST(? AS vector)) +
                        0.2 * (lower_emb.face_vector <=> CAST(? AS vector))) AS distance
                FROM customers c
                JOIN customer_embeddings upper_emb
                  ON upper_emb.customer_id = c.id AND LOWER(upper_emb.face_region) = 'upper'
                JOIN customer_embeddings mid_emb
                  ON mid_emb.customer_id = c.id AND LOWER(mid_emb.face_region) = 'mid'
                JOIN customer_embeddings lower_emb
                  ON lower_emb.customer_id = c.id AND LOWER(lower_emb.face_region) = 'lower'
                ORDER BY distance ASC
                LIMIT ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new CandidateRow(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("gender"),
                        rs.getObject("age", Integer.class),
                        rs.getString("user_image"),
                        rs.getDouble("distance")
                ),
                toVector(embeddings.upper()),
                toVector(embeddings.mid()),
                toVector(embeddings.lower()),
                limit
        );
    }

    public void upsertEmbeddings(
            Integer customerId,
            FaceAnalysisResponse response) {
        upsert(customerId, "upper", response.primaryFace().embeddings().upper(), response.modelVersion());
        upsert(customerId, "mid", response.primaryFace().embeddings().mid(), response.modelVersion());
        upsert(customerId, "lower", response.primaryFace().embeddings().lower(), response.modelVersion());
    }

    private void upsert(Integer customerId, String region, List<Double> vector, String modelVersion) {
        jdbcTemplate.update(
                """
                INSERT INTO customer_embeddings
                    (customer_id, face_region, face_vector, model_version, created_at, updated_at)
                VALUES (?, ?, CAST(? AS vector), ?, NOW(), NOW())
                ON CONFLICT (customer_id, face_region)
                DO UPDATE SET face_vector = EXCLUDED.face_vector,
                              model_version = EXCLUDED.model_version,
                              updated_at = NOW()
                """,
                customerId,
                region,
                toVector(vector),
                modelVersion
        );
    }

    public void saveAudit(
            UUID searchId,
            FaceAnalysisResponse analysis,
            String source,
            String status,
            Integer selectedCustomerId,
            Double bestDistance,
            String experienceState,
            List<CandidateRow> candidates) {
        try {
            String candidatesJson = objectMapper.writeValueAsString(candidates);
            jdbcTemplate.update(
                    """
                    INSERT INTO face_search_audit
                        (search_id, trace_id, source, result_status, selected_customer_id,
                         best_distance, quality_score, dominant_expression, experience_state,
                         candidate_snapshot)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS jsonb))
                    """,
                    searchId,
                    analysis.traceId(),
                    source,
                    status,
                    selectedCustomerId,
                    bestDistance,
                    analysis.primaryFace().quality().score(),
                    analysis.primaryFace().expression().dominant(),
                    experienceState,
                    candidatesJson
            );
        } catch (JsonProcessingException exc) {
            throw new IllegalStateException("Cannot serialize face-search candidates", exc);
        }
    }

    public int confirm(UUID searchId, Integer customerId) {
        return jdbcTemplate.update(
                """
                UPDATE face_search_audit
                SET selected_customer_id = ?, result_status = 'CONFIRMED', confirmed_at = ?
                WHERE search_id = ?
                """,
                customerId,
                Timestamp.from(Instant.now()),
                searchId
        );
    }

    private String toVector(List<Double> values) {
        if (values == null || values.size() != 512) {
            throw new IllegalArgumentException("Face embedding must contain exactly 512 values");
        }
        return "[" + String.join(",", values.stream().map(String::valueOf).toList()) + "]";
    }
}
