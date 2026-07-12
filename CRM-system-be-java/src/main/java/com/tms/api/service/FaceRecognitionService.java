package com.tms.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class FaceRecognitionService {

    private final WebClient webClient;

    public FaceRecognitionService(
            WebClient.Builder webClientBuilder,
            @Value("${ai.python-service-url}") String pythonServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(pythonServiceUrl).build();
    }

    @SuppressWarnings("rawtypes")
    public Map registerCustomer(MultipartFile file, String name, String userImage) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", file.getResource());
        builder.part("name", name);
        if (userImage != null) {
            builder.part("user_image", userImage);
        }

        MultiValueMap<String, HttpEntity<?>> multipartBody = builder.build();

        return webClient.post()
                .uri("/api/register")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipartBody))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @SuppressWarnings("rawtypes")
    public Map checkinCustomer(MultipartFile file) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", file.getResource());

        MultiValueMap<String, HttpEntity<?>> multipartBody = builder.build();

        return webClient.post()
                .uri("/api/checkin")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipartBody))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public boolean checkPythonHealth() {
        try {
            webClient.get()
                    .uri("/docs")
                    .retrieve()
                    .toBodilessEntity()
                    .block(java.time.Duration.ofMillis(800));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
