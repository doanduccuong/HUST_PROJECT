package com.tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "pd_product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PDProduct implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "prod_id")
    private Integer prodId;

    @Column(name = "org_id")
    private Integer orgId;

    @Column(name = "code")
    private String code;

    @Column(name = "category")
    private String category;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price")
    private String price;

    @Column(name = "dscr")
    private String dscr;

    @Column(name = "dscr_for_agent")
    private String dscrForAgent;

    @Column(name = "status")
    private Integer status;

    @Column(name = "country")
    private String country;
}
