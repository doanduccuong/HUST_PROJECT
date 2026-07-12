package com.tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "log_agent_trace")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "agent_id", nullable = false)
    private Integer agentId;

    @Column(name = "activity_id", nullable = false)
    private Integer activityId;

    @Column(name = "object_type")
    private String objectType;

    @Column(name = "object_id")
    private Integer objectId;

    @Column(name = "object_value")
    private String objectValue;

    @Column(name = "on_field")
    private String onField;

    @Column(name = "last_value")
    private String lastValue;

    @Column(name = "value", nullable = false)
    private String value;

    @Column(name = "message")
    private String message;

    @Column(name = "action_time", nullable = false)
    private LocalDateTime actionTime;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
