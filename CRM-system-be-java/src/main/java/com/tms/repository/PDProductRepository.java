package com.tms.repository;

import com.tms.entity.PDProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PDProductRepository extends JpaRepository<PDProduct, Integer> {
    List<PDProduct> findByCountry(String country);
}
