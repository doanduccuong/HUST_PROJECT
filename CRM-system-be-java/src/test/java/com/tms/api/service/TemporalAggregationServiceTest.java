package com.tms.api.service;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TemporalAggregationServiceTest {

    private final ExperienceStatePolicy policy = new ExperienceStatePolicy(5, 8);
    private final Instant startedAt = Instant.parse("2026-08-26T00:00:00Z");

    @Test
    void initializesAndUpdatesEmaUsingConfiguredAlpha() {
        var service = new TemporalAggregationService(policy, 0.35, 3, 2);
        UUID sessionId = UUID.randomUUID();

        service.update(sessionId, Map.of("happy", 0.0), true, "ENTRANCE", startedAt, startedAt);
        var result = service.update(
                sessionId, Map.of("happy", 1.0), true, "ENTRANCE", startedAt, startedAt.plusSeconds(1));

        assertThat(result.smoothedProbabilities().get("happy")).isCloseTo(0.35, within(0.000001));
    }

    @Test
    void rejectedFrameDoesNotChangeEmaOrAcceptedCount() {
        var service = new TemporalAggregationService(policy, 0.35, 3, 2);
        UUID sessionId = UUID.randomUUID();

        var result = service.update(
                sessionId, Map.of("happy", 1.0), false, "ENTRANCE", startedAt, startedAt);

        assertThat(result.smoothedProbabilities()).isEmpty();
        assertThat(result.acceptedFrames()).isZero();
        assertThat(result.stateChanged()).isFalse();
        assertThat(result.reason()).isEqualTo("QUALITY_REJECTED");
    }

    @Test
    void stableHappySequenceTransitionsToDelightedAfterDwell() {
        var service = new TemporalAggregationService(policy, 1.0, 3, 2);
        UUID sessionId = UUID.randomUUID();

        var first = service.update(
                sessionId, Map.of("happy", 0.80), true, "ENTRANCE", startedAt, startedAt);
        var second = service.update(
                sessionId, Map.of("happy", 0.80), true, "ENTRANCE", startedAt, startedAt.plusSeconds(1));
        var third = service.update(
                sessionId, Map.of("happy", 0.80), true, "ENTRANCE", startedAt, startedAt.plusSeconds(2));

        assertThat(first.state()).isEqualTo("NEUTRAL");
        assertThat(second.stateChanged()).isFalse();
        assertThat(third.state()).isEqualTo("DELIGHTED");
        assertThat(third.previousState()).isEqualTo("NEUTRAL");
        assertThat(third.stateChanged()).isTrue();
        assertThat(third.transitionCount()).isEqualTo(1);
    }

    @Test
    void singleNoisyFrameDoesNotCreateTransition() {
        var service = new TemporalAggregationService(policy, 1.0, 3, 2);
        UUID sessionId = UUID.randomUUID();

        service.update(sessionId, Map.of("neutral", 0.90), true, "ENTRANCE", startedAt, startedAt);
        service.update(sessionId, Map.of("neutral", 0.90), true, "ENTRANCE", startedAt, startedAt.plusSeconds(1));
        service.update(sessionId, Map.of("neutral", 0.90), true, "ENTRANCE", startedAt, startedAt.plusSeconds(2));
        var noisy = service.update(
                sessionId, Map.of("angry", 0.90), true, "ENTRANCE", startedAt, startedAt.plusSeconds(3));
        var recovered = service.update(
                sessionId, Map.of("neutral", 0.90, "angry", 0.0), true,
                "ENTRANCE", startedAt, startedAt.plusSeconds(4));

        assertThat(noisy.stateChanged()).isFalse();
        assertThat(recovered.state()).isEqualTo("NEUTRAL");
        assertThat(recovered.transitionCount()).isZero();
    }

    @Test
    void temporalStateIsIsolatedPerSessionAndRemovedOnClose() {
        var service = new TemporalAggregationService(policy, 1.0, 1, 0);
        UUID firstSession = UUID.randomUUID();
        UUID secondSession = UUID.randomUUID();

        service.update(firstSession, Map.of("happy", 0.90), true, "ENTRANCE", startedAt, startedAt);
        var firstTransition = service.update(
                firstSession, Map.of("happy", 0.90), true, "ENTRANCE", startedAt, startedAt);
        var secondSnapshot = service.update(
                secondSession, Map.of("neutral", 0.90), true, "ENTRANCE", startedAt, startedAt);

        assertThat(firstTransition.state()).isEqualTo("DELIGHTED");
        assertThat(secondSnapshot.state()).isEqualTo("NEUTRAL");

        service.close(firstSession);
        var afterClose = service.update(
                firstSession, Map.of("neutral", 0.90), false, "ENTRANCE", startedAt, startedAt);
        assertThat(afterClose.smoothedProbabilities()).isEmpty();
    }

    private static org.assertj.core.data.Offset<Double> within(double value) {
        return org.assertj.core.data.Offset.offset(value);
    }
}
