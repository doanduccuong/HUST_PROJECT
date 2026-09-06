package com.tms.api.dto.experience;

import java.time.Instant;
import java.util.UUID;

public record CloseExperienceSessionResponse(
        UUID sessionId,
        String status,
        Instant endedAt,
        String finalState,
        long totalFrames,
        long acceptedFrames,
        long rejectedFrames,
        long transitionCount
) {}
