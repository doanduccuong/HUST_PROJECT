package com.tms.repository;

import com.tms.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    
    Optional<Customer> findByName(String name);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO customer_embeddings (customer_id, face_region, face_vector) " +
                   "VALUES (?1, ?2, cast(?3 as vector)) " +
                   "ON CONFLICT (customer_id, face_region) DO UPDATE SET face_vector = cast(?3 as vector)", 
           nativeQuery = true)
    void saveEmbedding(Integer customerId, String faceRegion, String faceVectorString);

    @Query(value = "SELECT c.id as id, c.name as name, c.gender as gender, c.age as age, c.user_image as userImage, " +
                   "(0.5 * (e_upper.face_vector <=> cast(?1 as vector)) + " +
                   " 0.3 * (e_mid.face_vector <=> cast(?2 as vector)) + " +
                   " 0.2 * (e_lower.face_vector <=> cast(?3 as vector))) as score " +
                   "FROM customers c " +
                   "JOIN customer_embeddings e_upper ON c.id = e_upper.customer_id AND e_upper.face_region = 'Upper' " +
                   "JOIN customer_embeddings e_mid ON c.id = e_mid.customer_id AND e_mid.face_region = 'Mid' " +
                   "JOIN customer_embeddings e_lower ON c.id = e_lower.customer_id AND e_lower.face_region = 'Lower' " +
                   "ORDER BY score ASC LIMIT 1", 
           nativeQuery = true)
    Optional<CustomerMatchProjection> findNearestCustomer(String upperVector, String midVector, String lowerVector);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')", nativeQuery = true)
    boolean isPgVectorInstalled();
}
