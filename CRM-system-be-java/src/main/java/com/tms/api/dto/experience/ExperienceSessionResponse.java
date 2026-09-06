package com.tms.api.dto.experience;

import java.time.Instant;
import java.util.UUID;

public record ExperienceSessionResponse(
        UUID sessionId,
        String cameraId,
        String zone,
        Integer customerId,
        String sourceType,
        String status,
        Instant startedAt
) {}
