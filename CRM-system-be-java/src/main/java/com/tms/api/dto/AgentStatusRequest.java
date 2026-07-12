package com.tms.api.dto;

import lombok.Data;

@Data
public class AgentStatusRequest {
    private String status; // e.g. LOGIN, LOGOUT, BUSY, BREAK, ON_CALL, WRAP_UP
    private String message;
}
