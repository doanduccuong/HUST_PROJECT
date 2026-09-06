package com.tms.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TemporalAggregationService {

    private final ExperienceStatePolicy statePolicy;
    private final double alpha;
    private final int minimumAcceptedFrames;
    private final Duration transitionDwell;
    private final ConcurrentHashMap<UUID, SessionState> sessions = new ConcurrentHashMap<>();

    public TemporalAggregationService(
            ExperienceStatePolicy statePolicy,
            @Value("${experience.ema-alpha:0.35}") double alpha,
            @Value("${experience.minimum-accepted-frames:3}") int minimumAcceptedFrames,
            @Value("${experience.transition-dwell-seconds:2}") long transitionDwellSeconds) {
        if (alpha <= 0 || alpha > 1) {
            throw new IllegalArgumentException("EMA alpha must be in (0, 1]");
        }
        this.statePolicy = statePolicy;
        this.alpha = alpha;
        this.minimumAcceptedFrames = Math.max(1, minimumAcceptedFrames);
        this.transitionDwell = Duration.ofSeconds(Math.max(0, transitionDwellSeconds));
    }

    public Aggregation update(
            UUID sessionId,
            Map<String, Double> probabilities,
            boolean accepted,
            String zone,
            Instant sessionStartedAt,
            Instant observedAt) {
        SessionState state = sessions.computeIfAbsent(sessionId, ignored -> new SessionState());
        synchronized (state) {
            if (!accepted) {
                return state.snapshot(false, "QUALITY_REJECTED");
            }

            state.acceptedFrames++;
            probabilities.forEach((label, value) -> {
                double bounded = Math.max(0.0, Math.min(1.0, value));
                double previous = state.smoothed.getOrDefault(label, bounded);
                state.smoothed.put(label, state.acceptedFrames == 1
                        ? bounded
                        : alpha * bounded + (1.0 - alpha) * previous);
            });

            ExperienceStatePolicy.Decision decision = statePolicy.decide(
                    state.smoothed, zone, sessionStartedAt, observedAt);
            String previousState = state.currentState;
            boolean changed = false;

            if (decision.state().equals(state.currentState)) {
                state.candidateState = null;
                state.candidateSince = null;
                state.currentConfidence = decision.confidence();
            } else if (!decision.state().equals(state.candidateState)) {
                state.candidateState = decision.state();
                state.candidateSince = observedAt;
            } else if (state.acceptedFrames >= minimumAcceptedFrames
                    && !observedAt.isBefore(state.candidateSince.plus(transitionDwell))) {
                state.currentState = decision.state();
                state.currentConfidence = decision.confidence();
                state.transitionCount++;
                state.candidateState = null;
                state.candidateSince = null;
                changed = true;
            }

            return new Aggregation(
                    Collections.unmodifiableMap(new LinkedHashMap<>(state.smoothed)),
                    state.currentState,
                    state.currentConfidence,
                    previousState,
                    changed,
                    changed ? decision.reason() : "STABLE_OR_DWELLING",
                    state.acceptedFrames,
                    state.transitionCount
            );
        }
    }

    public void close(UUID sessionId) {
        sessions.remove(sessionId);
    }

    static final class SessionState {
        private final Map<String, Double> smoothed = new LinkedHashMap<>();
        private String currentState = "NEUTRAL";
        private double currentConfidence;
        private String candidateState;
        private Instant candidateSince;
        private long acceptedFrames;
        private long transitionCount;

        private Aggregation snapshot(boolean changed, String reason) {
            return new Aggregation(
                    Collections.unmodifiableMap(new LinkedHashMap<>(smoothed)),
                    currentState,
                    currentConfidence,
                    currentState,
                    changed,
                    reason,
                    acceptedFrames,
                    transitionCount
            );
        }
    }

    public record Aggregation(
            Map<String, Double> smoothedProbabilities,
            String state,
            double confidence,
            String previousState,
            boolean stateChanged,
            String reason,
            long acceptedFrames,
            long transitionCount
    ) {}
}
