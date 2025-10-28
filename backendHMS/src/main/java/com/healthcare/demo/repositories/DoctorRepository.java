package com.healthcare.demo.repositories;

import com.healthcare.demo.enums.Specialty;
import com.healthcare.demo.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Doctor findByEmail(String email);
    List<Doctor> findBySpecialty(Specialty specialty);

    // UPDATED: Only truly pending (not approved but still active)
    List<Doctor> findByIsApprovedFalseAndIsActiveTrue();

    // NEW: Get rejected doctors (not approved and not active)
    List<Doctor> findByIsApprovedFalseAndIsActiveFalse();

    // UPDATED: Count only truly pending (exclude rejected)
    long countByIsApprovedFalseAndIsActiveTrue();

    // Get approved doctors
    List<Doctor> findByIsApprovedTrue();

    // Get doctors by approval and active status
    List<Doctor> findByIsApprovedAndIsActive(Boolean isApproved, Boolean isActive);
}