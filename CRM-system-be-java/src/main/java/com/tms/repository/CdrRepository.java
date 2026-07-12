package com.tms.repository;

import com.tms.entity.Cdr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CdrRepository extends JpaRepository<Cdr, Integer> {
}
