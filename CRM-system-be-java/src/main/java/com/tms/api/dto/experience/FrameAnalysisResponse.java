package com.tms.api.dto.experience;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record FrameAnalysisResponse(
        UUID sessionId,
        long sequence,
        boolean accepted,
        double qualityScore,
        List<String> rejectReasons,
        String rawExpression,
        double rawConfidence,
        Map<String, Double> probabilities,
        Map<String, Double> smoothedProbabilities,
        String experienceState,
        double stateConfidence,
        String previousState,
        boolean stateChanged,
        String transitionReason,
        long inferenceMs,
        Instant observedAt
) {}
