package com.tms.api.dto.face;

import java.util.List;
import java.util.Map;

public record FaceAnalysisResponse(
        String traceId,
        String modelVersion,
        int faceCount,
        AnalyzedFace primaryFace
) {
    public record AnalyzedFace(
            Embeddings embeddings,
            Expression expression,
            Quality quality
    ) {}

    public record Embeddings(
            List<Double> upper,
            List<Double> mid,
            List<Double> lower
    ) {}

    public record Expression(
            String dominant,
            double confidence,
            Map<String, Double> probabilities
    ) {}

    public record Quality(
            double score,
            double blurScore,
            double brightnessScore,
            double detectionConfidence,
            boolean accepted,
            List<String> reasons
    ) {}
}
