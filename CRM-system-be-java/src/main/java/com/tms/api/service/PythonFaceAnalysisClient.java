package com.tms.api.service;

import com.tms.api.dto.face.FaceAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Service
public class PythonFaceAnalysisClient {

    private final WebClient webClient;
    private final Duration timeout;

    public PythonFaceAnalysisClient(
            WebClient.Builder builder,
            @Value("${ai.python-service-url}") String baseUrl,
            @Value("${ai.request-timeout-seconds:45}") long timeoutSeconds) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.timeout = Duration.ofSeconds(timeoutSeconds);
    }

    public FaceAnalysisResponse analyze(MultipartFile file) {
        MultipartBodyBuilder body = new MultipartBodyBuilder();
        body.part("file", file.getResource())
                .filename(file.getOriginalFilename() == null ? "face.jpg" : file.getOriginalFilename())
                .contentType(file.getContentType() == null
                        ? MediaType.APPLICATION_OCTET_STREAM
                        : MediaType.parseMediaType(file.getContentType()));

        MultiValueMap<String, HttpEntity<?>> multipartBody = body.build();
        FaceAnalysisResponse response = webClient.post()
                .uri("/internal/v1/faces/analyze")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipartBody))
                .retrieve()
                .bodyToMono(FaceAnalysisResponse.class)
                .block(timeout);

        if (response == null || response.primaryFace() == null) {
            throw new IllegalStateException("Python face service returned an empty response");
        }
        return response;
    }

    public boolean isHealthy() {
        try {
            webClient.get()
                    .uri("/docs")
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofMillis(800));
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }
}
