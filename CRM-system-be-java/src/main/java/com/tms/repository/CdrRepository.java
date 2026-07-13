package com.tms.repository;

import com.tms.entity.Cdr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CdrRepository extends JpaRepository<Cdr, Integer> {
    
    @Query("SELECT c.status, COUNT(c) FROM Cdr c GROUP BY c.status")
    List<Object[]> countByStatus();
}

