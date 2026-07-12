package com.tms.api.controller;

import com.tms.api.dto.AgentStatusRequest;
import com.tms.entity.AgentTrace;
import com.tms.entity.Synonym;
import com.tms.entity.User;
import com.tms.repository.AgentTraceRepository;
import com.tms.repository.SynonymRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentController {

    private final SynonymRepository synonymRepository;
    private final AgentTraceRepository agentTraceRepository;

    @PostMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody AgentStatusRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 1. Find the synonym mapping for the requested agent status
        Optional<Synonym> synonymOpt = synonymRepository.findByTypeAndName("AGENT STATE", request.getStatus());
        if (synonymOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Unsupported status: " + request.getStatus());
        }

        Synonym synonym = synonymOpt.get();

        // 2. Create and persist the trace log
        AgentTrace trace = AgentTrace.builder()
                .agentId(user.getUserId())
                .activityId(synonym.getSynonymId())
                .objectType("AGENT")
                .objectId(user.getUserId())
                .value(request.getStatus())
                .message(request.getMessage())
                .actionTime(LocalDateTime.now())
                .build();

        agentTraceRepository.save(trace);

        return ResponseEntity.ok("Agent status successfully updated to " + request.getStatus());
    }
}
