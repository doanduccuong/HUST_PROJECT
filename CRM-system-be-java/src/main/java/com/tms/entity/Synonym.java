package com.tms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cf_synonym")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Synonym {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "synonym_id")
    private Integer synonymId;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "value", nullable = false)
    private Integer value;

    @Column(name = "type_id")
    private Integer typeId;
}
