package com.tms.api.service;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ExperienceStatePolicyTest {

    private final ExperienceStatePolicy policy = new ExperienceStatePolicy(5, 8);
    private final Instant startedAt = Instant.parse("2026-08-26T00:00:00Z");

    @Test
    void negativeExpressionHasHighestPriority() {
        var decision = policy.decide(
                Map.of("angry", 0.70, "neutral", 0.20),
                "WAITING",
                startedAt,
                startedAt.plusSeconds(20));

        assertThat(decision.state()).isEqualTo("DISSATISFIED");
    }

    @Test
    void waitingDwellProducesImpatientState() {
        var decision = policy.decide(
                Map.of("neutral", 0.80),
                "WAITING",
                startedAt,
                startedAt.plusSeconds(8));

        assertThat(decision.state()).isEqualTo("IMPATIENT");
        assertThat(decision.reason()).isEqualTo("WAITING_DWELL_TIME");
    }

    @Test
    void productDwellProducesEngagedState() {
        var decision = policy.decide(
                Map.of("neutral", 0.75),
                "PRODUCT",
                startedAt,
                startedAt.plusSeconds(5));

        assertThat(decision.state()).isEqualTo("ENGAGED");
    }

    @Test
    void happyProducesDelightedBeforeEngaged() {
        var decision = policy.decide(
                Map.of("happy", 0.75, "neutral", 0.20),
                "PRODUCT",
                startedAt,
                startedAt.plusSeconds(10));

        assertThat(decision.state()).isEqualTo("DELIGHTED");
    }

    @Test
    void fearOrSurpriseProducesConfusedState() {
        var decision = policy.decide(
                Map.of("surprise", 0.60),
                "ENTRANCE",
                startedAt,
                startedAt.plusSeconds(1));

        assertThat(decision.state()).isEqualTo("CONFUSED");
    }

    @Test
    void neutralIsDefaultState() {
        var decision = policy.decide(
                Map.of("neutral", 0.80),
                "ENTRANCE",
                startedAt,
                startedAt.plusSeconds(30));

        assertThat(decision.state()).isEqualTo("NEUTRAL");
    }
}
