package com.tms.api.service;

import com.tms.api.dto.experience.ExperienceDataMode;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ExperienceDataModeTest {

    @Test
    void realModeExcludesBothLegacySyntheticSessionOrigins() {
        assertThat(ExperienceDataMode.REAL_ONLY.sessionPredicate("es"))
                .isEqualTo("es.data_origin NOT IN ('SYNTHETIC_METADATA', 'SYNTHETIC_DEMO')");
    }

    @Test
    void demoModeSelectsSyntheticEvents() {
        assertThat(ExperienceDataMode.DEMO_ONLY.eventPredicate("event"))
                .isEqualTo("event.source = 'SYNTHETIC_DEMO'");
    }

    @Test
    void allModeDoesNotRestrictData() {
        assertThat(ExperienceDataMode.ALL.sessionPredicate(null)).isEqualTo("1=1");
        assertThat(ExperienceDataMode.ALL.eventPredicate(null)).isEqualTo("1=1");
        assertThat(ExperienceDataMode.ALL.purchasePredicate(null)).isEqualTo("1=1");
    }
}
