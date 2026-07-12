package com.tms.repository;

import com.tms.entity.AgentTrace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentTraceRepository extends JpaRepository<AgentTrace, Long> {
}
