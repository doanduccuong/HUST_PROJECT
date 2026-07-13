package com.tms.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MySaleTunnelDto {
    @Builder.Default
    private Integer lead = 0;
    @Builder.Default
    private Integer saleOrder = 0;
    @Builder.Default
    private Integer delivered = 0;
    @Builder.Default
    private Integer paid = 0;
}
