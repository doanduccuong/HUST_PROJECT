package com.tms.api.dto.face;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record FaceSearchResponse(
        UUID searchId,
        String traceId,
        String status,
        String modelVersion,
        FaceQuality quality,
        ExpressionSnapshot currentExpression,
        ExperienceSnapshot currentExperience,
        List<Candidate> candidates
) {
    public record FaceQuality(
            double score,
            boolean accepted,
            List<String> reasons
    ) {}

    public record ExpressionSnapshot(
            String dominant,
            double confidence,
            Map<String, Double> probabilities
    ) {}

    public record ExperienceSnapshot(
            String state,
            double confidence,
            String basis,
            String limitation
    ) {}

    public record Candidate(
            Integer customerId,
            String name,
            String gender,
            Integer age,
            String avatarUrl,
            double distance,
            double similarity
    ) {}
}
