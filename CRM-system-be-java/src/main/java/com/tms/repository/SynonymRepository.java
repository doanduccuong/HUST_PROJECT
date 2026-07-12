package com.tms.repository;

import com.tms.entity.Synonym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SynonymRepository extends JpaRepository<Synonym, Integer> {
    Optional<Synonym> findByTypeAndName(String type, String name);
}
