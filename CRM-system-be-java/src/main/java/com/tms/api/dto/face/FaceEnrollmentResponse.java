package com.tms.api.dto.face;

public record FaceEnrollmentResponse(
        String status,
        Integer customerId,
        String name,
        String modelVersion,
        double qualityScore,
        String message
) {}
