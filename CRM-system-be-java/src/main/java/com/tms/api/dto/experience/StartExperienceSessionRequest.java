package com.tms.api.dto.experience;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StartExperienceSessionRequest(
        @NotBlank @Size(max = 50) String cameraId,
        @NotBlank @Size(max = 50) String zone,
        Integer customerId,
        @NotBlank @Pattern(regexp = "WEBCAM|VIDEO_FILE|IMPORT") String sourceType
) {}
