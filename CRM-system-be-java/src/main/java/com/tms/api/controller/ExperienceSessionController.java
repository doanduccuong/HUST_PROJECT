package com.tms.api.controller;

import com.tms.api.dto.experience.CloseExperienceSessionResponse;
import com.tms.api.dto.experience.ExperienceSessionResponse;
import com.tms.api.dto.experience.FrameAnalysisResponse;
import com.tms.api.dto.experience.StartExperienceSessionRequest;
import com.tms.api.service.ExperienceSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/experience/sessions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ExperienceSessionController {

    private final ExperienceSessionService sessionService;

    @PostMapping
    public ResponseEntity<ExperienceSessionResponse> start(
            @Valid @RequestBody StartExperienceSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.start(request));
    }

    @PostMapping(value = "/{sessionId}/frames", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FrameAnalysisResponse> analyzeFrame(
            @PathVariable UUID sessionId,
            @RequestPart("file") MultipartFile file,
            @RequestParam("sequence") long sequence,
            @RequestParam(value = "capturedAt", required = false) Instant capturedAt) {
        return ResponseEntity.ok(sessionService.analyzeFrame(sessionId, file, sequence, capturedAt));
    }

    @PostMapping("/{sessionId}/close")
    public ResponseEntity<CloseExperienceSessionResponse> close(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.close(sessionId));
    }
}
