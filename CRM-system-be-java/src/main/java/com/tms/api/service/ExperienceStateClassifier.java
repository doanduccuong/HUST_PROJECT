package com.tms.api.service;

import com.tms.api.dto.face.FaceAnalysisResponse;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ExperienceStateClassifier {

    public record Classification(String state, double confidence, String basis, String limitation) {}

    public Classification classify(FaceAnalysisResponse.Expression expression) {
        Map<String, Double> probabilities = expression.probabilities();
        double happy = probabilities.getOrDefault("happy", 0.0);
        double angry = probabilities.getOrDefault("angry", 0.0);
        double disgust = probabilities.getOrDefault("disgust", 0.0);
        double sad = probabilities.getOrDefault("sad", 0.0);
        double fear = probabilities.getOrDefault("fear", 0.0);
        double surprise = probabilities.getOrDefault("surprise", 0.0);

        if (Math.max(Math.max(angry, disgust), sad) >= 0.45) {
            return result("DISSATISFIED", Math.max(Math.max(angry, disgust), sad));
        }
        if (happy >= 0.55) {
            return result("DELIGHTED", happy);
        }
        if (Math.max(fear, surprise) >= 0.40) {
            return result("CONFUSED", Math.max(fear, surprise));
        }
        return result("NEUTRAL", probabilities.getOrDefault("neutral", expression.confidence()));
    }

    private Classification result(String state, double confidence) {
        return new Classification(
                state,
                confidence,
                "SINGLE_IMAGE_EXPRESSION_HEURISTIC",
                "ENGAGED và IMPATIENT cần chuỗi thời gian/hành vi; không suy ra từ một ảnh tĩnh."
        );
    }
}
