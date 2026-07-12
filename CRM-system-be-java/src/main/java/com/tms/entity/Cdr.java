package com.tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "log_cdr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cdr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "call_type")
    private String callType;

    @Column(name = "agent")
    private String agent;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "call_time", insertable = false, updatable = false)
    private ZonedDateTime callTime;

    @Column(name = "status")
    private String status;
}
