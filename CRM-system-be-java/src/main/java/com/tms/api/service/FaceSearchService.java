package com.tms.api.service;

import com.tms.api.dto.face.FaceAnalysisResponse;
import com.tms.api.dto.face.FaceSearchResponse;
import com.tms.repository.CustomerRepository;
import com.tms.repository.FaceVectorRepository;
import com.tms.repository.FaceVectorRepository.CandidateRow;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class FaceSearchService {

    private final PythonFaceAnalysisClient analysisClient;
    private final FaceVectorRepository vectorRepository;
    private final FaceMatchPolicy matchPolicy;
    private final ExperienceStateClassifier stateClassifier;
    private final CustomerRepository customerRepository;

    public FaceSearchService(
            PythonFaceAnalysisClient analysisClient,
            FaceVectorRepository vectorRepository,
            FaceMatchPolicy matchPolicy,
            ExperienceStateClassifier stateClassifier,
            CustomerRepository customerRepository) {
        this.analysisClient = analysisClient;
        this.vectorRepository = vectorRepository;
        this.matchPolicy = matchPolicy;
        this.stateClassifier = stateClassifier;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public FaceSearchResponse identify(MultipartFile file, String source) {
        FaceAnalysisResponse analysis = analysisClient.analyze(file);
        var face = analysis.primaryFace();
        var experience = stateClassifier.classify(face.expression());
        UUID searchId = UUID.randomUUID();

        List<CandidateRow> rows = face.quality().accepted()
                ? vectorRepository.findNearest(face.embeddings(), 3)
                : List.of();
        String status = face.quality().accepted()
                ? matchPolicy.decide(rows)
                : "QUALITY_REJECTED";
        Integer selectedCustomerId = "MATCH".equals(status) && !rows.isEmpty()
                ? rows.get(0).customerId()
                : null;
        Double bestDistance = rows.isEmpty() ? null : rows.get(0).distance();

        vectorRepository.saveAudit(
                searchId,
                analysis,
                sanitizeSource(source),
                status,
                selectedCustomerId,
                bestDistance,
                experience.state(),
                rows
        );

        List<FaceSearchResponse.Candidate> candidates = rows.stream()
                .map(row -> new FaceSearchResponse.Candidate(
                        row.customerId(),
                        row.name(),
                        row.gender(),
                        row.age(),
                        row.userImage(),
                        round(row.distance()),
                        round(Math.max(0.0, 1.0 - row.distance()))
                ))
                .toList();

        return new FaceSearchResponse(
                searchId,
                analysis.traceId(),
                status,
                analysis.modelVersion(),
                new FaceSearchResponse.FaceQuality(
                        face.quality().score(),
                        face.quality().accepted(),
                        face.quality().reasons()
                ),
                new FaceSearchResponse.ExpressionSnapshot(
                        face.expression().dominant(),
                        face.expression().confidence(),
                        face.expression().probabilities()
                ),
                new FaceSearchResponse.ExperienceSnapshot(
                        experience.state(),
                        experience.confidence(),
                        experience.basis(),
                        experience.limitation()
                ),
                candidates
        );
    }

    @Transactional
    public void confirm(UUID searchId, Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
        if (vectorRepository.confirm(searchId, customerId) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Face search not found");
        }
    }

    private String sanitizeSource(String source) {
        String value = source == null ? "IMPORT" : source.trim().toUpperCase();
        return switch (value) {
            case "IMPORT", "CAMERA_EVENT", "ENROLLMENT" -> value;
            default -> "IMPORT";
        };
    }

    private double round(double value) {
        return Math.round(value * 10000.0) / 10000.0;
    }
}
