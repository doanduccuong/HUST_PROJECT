package com.tms.api.service;

import com.tms.repository.FaceVectorRepository.CandidateRow;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FaceMatchPolicyTest {

    private final FaceMatchPolicy policy = new FaceMatchPolicy(0.30, 0.40, 0.03);

    @Test
    void autoAcceptsClearNearestCandidate() {
        assertThat(policy.decide(List.of(candidate(1, 0.20), candidate(2, 0.28))))
                .isEqualTo("MATCH");
    }

    @Test
    void requiresReviewWhenTopCandidatesAreTooClose() {
        assertThat(policy.decide(List.of(candidate(1, 0.20), candidate(2, 0.22))))
                .isEqualTo("REVIEW");
    }

    @Test
    void returnsNewCustomerOutsideReviewThreshold() {
        assertThat(policy.decide(List.of(candidate(1, 0.41))))
                .isEqualTo("NEW_CUSTOMER");
    }

    @Test
    void returnsNewCustomerWhenDatabaseHasNoEmbeddings() {
        assertThat(policy.decide(List.of())).isEqualTo("NEW_CUSTOMER");
    }

    private CandidateRow candidate(int id, double distance) {
        return new CandidateRow(id, "Customer " + id, null, null, null, distance);
    }
}
