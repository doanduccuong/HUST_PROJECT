package com.tms.api.dto.face;

import jakarta.validation.constraints.NotNull;

public record ConfirmFaceSearchRequest(
        @NotNull Integer customerId
) {}
