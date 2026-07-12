package com.tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "so_sales_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "so_id")
    private Integer id;

    @Column(name = "so_code", unique = true, nullable = false)
    private String soCode;

    @Column(name = "lead_name")
    private String leadName;

    @Column(name = "lead_phone")
    private String leadPhone;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "delivery_service")
    private String deliveryService;

    @Column(name = "cross_sell")
    private String crossSell;

    @Column(name = "affiliate_id")
    private String affiliateId;

    @Column(name = "sub_id1")
    private String subId1;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "agency")
    private String agency;

    @Column(name = "assigned")
    private String assigned;

    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;
}
