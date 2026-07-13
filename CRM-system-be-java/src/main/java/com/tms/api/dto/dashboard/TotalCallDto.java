package com.tms.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotalCallDto {
    @Builder.Default
    private Integer connected = 0;
    @Builder.Default
    private Integer busy = 0;
    @Builder.Default
    private Integer invalid = 0;
    @Builder.Default
    private Integer total = 0;
}
