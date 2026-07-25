package com.tms.api.service;

import com.tms.repository.FaceVectorRepository.CandidateRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FaceMatchPolicy {

    private final double autoAcceptDistance;
    private final double reviewDistance;
    private final double minimumGap;

    public FaceMatchPolicy(
            @Value("${ai.face-match.auto-accept-distance:0.30}") double autoAcceptDistance,
            @Value("${ai.face-match.review-distance:0.40}") double reviewDistance,
            @Value("${ai.face-match.minimum-gap:0.03}") double minimumGap) {
        this.autoAcceptDistance = autoAcceptDistance;
        this.reviewDistance = reviewDistance;
        this.minimumGap = minimumGap;
    }

    public String decide(List<CandidateRow> candidates) {
        if (candidates.isEmpty()) {
            return "NEW_CUSTOMER";
        }
        double best = candidates.get(0).distance();
        double gap = candidates.size() > 1
                ? candidates.get(1).distance() - best
                : Double.POSITIVE_INFINITY;

        if (best <= autoAcceptDistance && gap >= minimumGap) {
            return "MATCH";
        }
        if (best <= reviewDistance) {
            return "REVIEW";
        }
        return "NEW_CUSTOMER";
    }
}
