package com.tms.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;

@Component
public class ExperienceStatePolicy {

    private final Duration engagedDwell;
    private final Duration impatientDwell;

    public ExperienceStatePolicy(
            @Value("${experience.engaged-dwell-seconds:5}") long engagedDwellSeconds,
            @Value("${experience.impatient-dwell-seconds:8}") long impatientDwellSeconds) {
        this.engagedDwell = Duration.ofSeconds(engagedDwellSeconds);
        this.impatientDwell = Duration.ofSeconds(impatientDwellSeconds);
    }

    public Decision decide(Map<String, Double> probabilities, String zone, Instant startedAt, Instant observedAt) {
        double happy = probability(probabilities, "happy");
        double angry = probability(probabilities, "angry");
        double disgust = probability(probabilities, "disgust");
        double sad = probability(probabilities, "sad");
        double fear = probability(probabilities, "fear");
        double surprise = probability(probabilities, "surprise");
        double neutral = probability(probabilities, "neutral");
        double negative = Math.max(Math.max(angry, disgust), sad);
        double confused = Math.max(fear, surprise);
        Duration dwell = Duration.between(startedAt, observedAt);
        String normalizedZone = zone == null ? "" : zone.trim().toUpperCase(Locale.ROOT);

        if (negative >= 0.45) {
            return new Decision("DISSATISFIED", negative, "NEGATIVE_EXPRESSION");
        }
        if (isWaitingZone(normalizedZone) && dwell.compareTo(impatientDwell) >= 0) {
            return new Decision("IMPATIENT", Math.max(neutral, negative), "WAITING_DWELL_TIME");
        }
        if (confused >= 0.40) {
            return new Decision("CONFUSED", confused, "FEAR_OR_SURPRISE");
        }
        if (happy >= 0.55) {
            return new Decision("DELIGHTED", happy, "HAPPY_EXPRESSION");
        }
        if (isEngagementZone(normalizedZone)
                && dwell.compareTo(engagedDwell) >= 0
                && Math.max(neutral, happy) >= 0.40) {
            return new Decision("ENGAGED", Math.max(neutral, happy), "ENGAGEMENT_DWELL_TIME");
        }
        return new Decision("NEUTRAL", neutral, "DEFAULT_NEUTRAL");
    }

    private static boolean isWaitingZone(String zone) {
        return zone.contains("WAIT") || zone.contains("QUEUE") || zone.contains("SERVICE");
    }

    private static boolean isEngagementZone(String zone) {
        return zone.contains("PRODUCT") || zone.contains("CONSULT") || zone.contains("DISPLAY");
    }

    private static double probability(Map<String, Double> probabilities, String label) {
        return Math.max(0.0, Math.min(1.0, probabilities.getOrDefault(label, 0.0)));
    }

    public record Decision(String state, double confidence, String reason) {}
}
