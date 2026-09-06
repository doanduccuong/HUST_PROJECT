package com.tms.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.api.dto.experience.CloseExperienceSessionResponse;
import com.tms.api.dto.experience.ExperienceSessionResponse;
import com.tms.api.dto.experience.FrameAnalysisResponse;
import com.tms.api.dto.experience.StartExperienceSessionRequest;
import com.tms.api.service.ExperienceSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ExperienceSessionControllerTest {

    @Mock
    private ExperienceSessionService sessionService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ExperienceSessionController(sessionService)).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void startsSessionAndReturnsCreated() throws Exception {
        UUID sessionId = UUID.randomUUID();
        Instant startedAt = Instant.parse("2026-08-26T00:00:00Z");
        var request = new StartExperienceSessionRequest("CAM-01", "PRODUCT", null, "VIDEO_FILE");
        when(sessionService.start(any())).thenReturn(new ExperienceSessionResponse(
                sessionId, "CAM-01", "PRODUCT", null, "VIDEO_FILE", "OPEN", startedAt));

        mockMvc.perform(post("/api/v1/experience/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").value(sessionId.toString()))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void rejectsInvalidSessionRequestBeforeCallingService() throws Exception {
        var request = new StartExperienceSessionRequest("", "", null, "INVALID");

        mockMvc.perform(post("/api/v1/experience/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(sessionService);
    }

    @Test
    void acceptsMultipartFrameAndReturnsAnalysis() throws Exception {
        UUID sessionId = UUID.randomUUID();
        Instant observedAt = Instant.parse("2026-08-26T00:00:01Z");
        MockMultipartFile frame = new MockMultipartFile(
                "file", "frame.jpg", MediaType.IMAGE_JPEG_VALUE, "frame".getBytes());
        when(sessionService.analyzeFrame(eq(sessionId), any(), eq(1L), any())).thenReturn(
                new FrameAnalysisResponse(
                        sessionId, 1, true, 0.9, List.of(), "happy", 0.8,
                        Map.of("happy", 0.8), Map.of("happy", 0.7),
                        "DELIGHTED", 0.7, "NEUTRAL", true,
                        "HAPPY_EXPRESSION", 120, observedAt));

        mockMvc.perform(multipart("/api/v1/experience/sessions/{sessionId}/frames", sessionId)
                        .file(frame)
                        .param("sequence", "1")
                        .param("capturedAt", "2026-08-26T00:00:01Z"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted").value(true))
                .andExpect(jsonPath("$.experienceState").value("DELIGHTED"))
                .andExpect(jsonPath("$.stateChanged").value(true));
    }

    @Test
    void closesSessionIdempotentlyThroughServiceContract() throws Exception {
        UUID sessionId = UUID.randomUUID();
        Instant endedAt = Instant.parse("2026-08-26T00:01:00Z");
        when(sessionService.close(sessionId)).thenReturn(new CloseExperienceSessionResponse(
                sessionId, "CLOSED", endedAt, "DELIGHTED", 60, 55, 5, 2));

        mockMvc.perform(post("/api/v1/experience/sessions/{sessionId}/close", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.totalFrames").value(60))
                .andExpect(jsonPath("$.transitionCount").value(2));
    }
}
