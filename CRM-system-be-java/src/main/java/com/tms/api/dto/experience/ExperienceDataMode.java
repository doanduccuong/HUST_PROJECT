package com.tms.api.dto.experience;

public enum ExperienceDataMode {
    REAL_ONLY,
    DEMO_ONLY,
    ALL;

    public String sessionPredicate(String alias) {
        String column = qualify(alias, "data_origin");
        return switch (this) {
            case REAL_ONLY -> column + " NOT IN ('SYNTHETIC_METADATA', 'SYNTHETIC_DEMO')";
            case DEMO_ONLY -> column + " IN ('SYNTHETIC_METADATA', 'SYNTHETIC_DEMO')";
            case ALL -> "1=1";
        };
    }

    public String eventPredicate(String alias) {
        String column = qualify(alias, "source");
        return switch (this) {
            case REAL_ONLY -> column + " <> 'SYNTHETIC_DEMO'";
            case DEMO_ONLY -> column + " = 'SYNTHETIC_DEMO'";
            case ALL -> "1=1";
        };
    }

    public String purchasePredicate(String alias) {
        String column = qualify(alias, "data_origin");
        return switch (this) {
            case REAL_ONLY -> column + " <> 'SYNTHETIC_DEMO'";
            case DEMO_ONLY -> column + " = 'SYNTHETIC_DEMO'";
            case ALL -> "1=1";
        };
    }

    private static String qualify(String alias, String column) {
        return alias == null || alias.isBlank() ? column : alias + "." + column;
    }
}
