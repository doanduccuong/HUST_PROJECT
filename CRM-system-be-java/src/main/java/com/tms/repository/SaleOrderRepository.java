package com.tms.repository;

import com.tms.entity.SaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleOrderRepository extends JpaRepository<SaleOrder, Integer> {
    
    @Query("SELECT COALESCE(SUM(o.amount), 0.0) FROM SaleOrder o")
    Double sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.amount), 0.0) FROM SaleOrder o WHERE UPPER(o.status) = 'PAID'")
    Double sumPaidRevenue();

    long countByStatusIgnoreCase(String status);
}
