package com.tms.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaticLeadDto {
    @Builder.Default
    private Integer approved = 0;
    @Builder.Default
    private Integer rejected = 0;
    @Builder.Default
    private Integer callback = 0;
    @Builder.Default
    private Integer trash = 0;
    @Builder.Default
    private Integer noanws = 0;
    @Builder.Default
    private Integer busy = 0;
    @Builder.Default
    private Integer unreach = 0;
    @Builder.Default
    private Integer total = 0;
    @Builder.Default
    private Integer unCall = 0;

    public Integer getCallingConnected() {
        return (approved != null ? approved : 0) + 
               (rejected != null ? rejected : 0) + 
               (callback != null ? callback : 0);
    }

    public Integer getCallingBusy() {
        return (busy != null ? busy : 0) + 
               (noanws != null ? noanws : 0) + 
               (unreach != null ? unreach : 0);
    }

    public Integer getCallingTotal() {
        return getCallingConnected() + getCallingBusy() + (trash != null ? trash : 0);
    }
}
