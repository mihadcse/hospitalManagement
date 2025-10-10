package com.healthcare.demo.repositories;

import com.healthcare.demo.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Admin findByEmail(String email);
    Optional<Admin> findByEmailAndIsActive(String email, Boolean isActive);
    boolean existsByEmail(String email);
}