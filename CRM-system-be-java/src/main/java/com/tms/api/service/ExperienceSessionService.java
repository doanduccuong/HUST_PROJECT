package com.tms.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.api.dto.experience.CloseExperienceSessionResponse;
import com.tms.api.dto.experience.ExperienceSessionResponse;
import com.tms.api.dto.experience.FrameAnalysisResponse;
import com.tms.api.dto.experience.StartExperienceSessionRequest;
import com.tms.api.dto.face.FaceAnalysisResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExperienceSessionService {

    private static final String REAL_DATA_ORIGIN = "REAL_MODEL";
    private static final String REAL_EVENT_SOURCE = "REAL_MODEL";

    private final JdbcTemplate jdbcTemplate;
    private final PythonFaceAnalysisClient faceAnalysisClient;
    private final TemporalAggregationService temporalAggregationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public ExperienceSessionResponse start(StartExperienceSessionRequest request) {
        UUID sessionId = UUID.randomUUID();
        Instant startedAt = Instant.now();
        String cameraId = normalize(request.cameraId());
        String zone = normalize(request.zone());
        String sourceType = request.sourceType().toUpperCase(Locale.ROOT);

        jdbcTemplate.update("""
                INSERT INTO experience_sessions (
                    id, customer_id, camera_id, zone, local_track_id,
                    started_at, data_origin, status, source_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
                """,
                sessionId,
                request.customerId(),
                cameraId,
                zone,
                "track-" + sessionId,
                Timestamp.from(startedAt),
                REAL_DATA_ORIGIN,
                sourceType
        );

        return new ExperienceSessionResponse(
                sessionId, cameraId, zone, request.customerId(), sourceType, "OPEN", startedAt);
    }

    @Transactional
    public synchronized FrameAnalysisResponse analyzeFrame(
            UUID sessionId,
            MultipartFile file,
            long sequence,
            Instant capturedAt) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Frame image is required");
        }
        if (sequence <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Frame sequence must be positive");
        }

        SessionRow session = findSession(sessionId);
        if (!"OPEN".equals(session.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Experience session is already closed");
        }
        if (sequence <= session.lastFrameSequence()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Frame sequence must be strictly increasing");
        }

        Instant observedAt = Instant.now();
        Instant sourceTimestamp = capturedAt == null ? observedAt : capturedAt;
        FaceAnalysisResponse analysis = faceAnalysisClient.analyze(file);
        FaceAnalysisResponse.AnalyzedFace face = analysis.primaryFace();
        FaceAnalysisResponse.Quality quality = face.quality();
        FaceAnalysisResponse.Expression expression = face.expression();

        TemporalAggregationService.Aggregation aggregation = temporalAggregationService.update(
                sessionId,
                expression.probabilities(),
                quality.accepted(),
                session.zone(),
                session.startedAt(),
                sourceTimestamp
        );

        insertEvent(
                session,
                sequence,
                sourceTimestamp,
                observedAt,
                analysis,
                aggregation
        );

        jdbcTemplate.update("""
                UPDATE experience_sessions
                SET total_frames = total_frames + 1,
                    accepted_frames = accepted_frames + ?,
                    rejected_frames = rejected_frames + ?,
                    transition_count = transition_count + ?,
                    last_frame_sequence = ?
                WHERE id = ?
                """,
                quality.accepted() ? 1 : 0,
                quality.accepted() ? 0 : 1,
                aggregation.stateChanged() ? 1 : 0,
                sequence,
                sessionId
        );

        return new FrameAnalysisResponse(
                sessionId,
                sequence,
                quality.accepted(),
                quality.score(),
                quality.reasons(),
                expression.dominant(),
                expression.confidence(),
                expression.probabilities(),
                aggregation.smoothedProbabilities(),
                aggregation.state(),
                aggregation.confidence(),
                aggregation.previousState(),
                aggregation.stateChanged(),
                aggregation.reason(),
                analysis.inferenceMs(),
                observedAt
        );
    }

    @Transactional
    public CloseExperienceSessionResponse close(UUID sessionId) {
        SessionRow current = findSession(sessionId);
        if ("OPEN".equals(current.status())) {
            Instant endedAt = Instant.now();
            jdbcTemplate.update("""
                    UPDATE experience_sessions
                    SET status = 'CLOSED',
                        ended_at = ?,
                        final_state = COALESCE(
                            (SELECT experience_state
                             FROM experience_state_events
                             WHERE session_id = ?
                             ORDER BY observed_at DESC, id DESC
                             LIMIT 1),
                            'NEUTRAL'
                        )
                    WHERE id = ? AND status = 'OPEN'
                    """, Timestamp.from(endedAt), sessionId, sessionId);
            temporalAggregationService.close(sessionId);
        }
        return findCloseResponse(sessionId);
    }

    private void insertEvent(
            SessionRow session,
            long sequence,
            Instant capturedAt,
            Instant observedAt,
            FaceAnalysisResponse analysis,
            TemporalAggregationService.Aggregation aggregation) {
        FaceAnalysisResponse.AnalyzedFace face = analysis.primaryFace();
        FaceAnalysisResponse.Quality quality = face.quality();
        FaceAnalysisResponse.Expression expression = face.expression();

        jdbcTemplate.update("""
                INSERT INTO experience_state_events (
                    session_id, customer_id, camera_id, zone, observed_at,
                    raw_expression, raw_expression_confidence,
                    experience_state, state_confidence,
                    expression_probabilities, source, model_version,
                    frame_sequence, captured_at, quality_score, accepted,
                    reject_reasons, inference_ms, previous_state,
                    state_changed, transition_reason, smoothed_probabilities
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?,
                    ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?::jsonb
                )
                """,
                session.id(),
                session.customerId(),
                session.cameraId(),
                session.zone(),
                Timestamp.from(observedAt),
                expression.dominant(),
                expression.confidence(),
                aggregation.state(),
                aggregation.confidence(),
                json(expression.probabilities()),
                REAL_EVENT_SOURCE,
                analysis.modelVersion(),
                sequence,
                Timestamp.from(capturedAt),
                quality.score(),
                quality.accepted(),
                json(quality.reasons()),
                analysis.inferenceMs(),
                aggregation.previousState(),
                aggregation.stateChanged(),
                aggregation.reason(),
                json(aggregation.smoothedProbabilities())
        );
    }

    private SessionRow findSession(UUID sessionId) {
        List<SessionRow> rows = jdbcTemplate.query("""
                SELECT id, customer_id, camera_id, zone, started_at, status, last_frame_sequence
                FROM experience_sessions
                WHERE id = ?
                """, (rs, rowNum) -> new SessionRow(
                rs.getObject("id", UUID.class),
                (Integer) rs.getObject("customer_id"),
                rs.getString("camera_id"),
                rs.getString("zone"),
                rs.getTimestamp("started_at").toInstant(),
                rs.getString("status"),
                rs.getLong("last_frame_sequence")
        ), sessionId);
        if (rows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience session not found");
        }
        return rows.get(0);
    }

    private CloseExperienceSessionResponse findCloseResponse(UUID sessionId) {
        List<CloseExperienceSessionResponse> rows = jdbcTemplate.query("""
                SELECT id, status, ended_at, COALESCE(final_state, 'NEUTRAL') AS final_state,
                       total_frames, accepted_frames, rejected_frames, transition_count
                FROM experience_sessions
                WHERE id = ?
                """, (rs, rowNum) -> new CloseExperienceSessionResponse(
                rs.getObject("id", UUID.class),
                rs.getString("status"),
                rs.getTimestamp("ended_at") == null ? null : rs.getTimestamp("ended_at").toInstant(),
                rs.getString("final_state"),
                rs.getLong("total_frames"),
                rs.getLong("accepted_frames"),
                rs.getLong("rejected_frames"),
                rs.getLong("transition_count")
        ), sessionId);
        if (rows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience session not found");
        }
        return rows.get(0);
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize experience event", exception);
        }
    }

    private static String normalize(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private record SessionRow(
            UUID id,
            Integer customerId,
            String cameraId,
            String zone,
            Instant startedAt,
            String status,
            long lastFrameSequence
    ) {}
}
