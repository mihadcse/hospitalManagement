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

    // NEW METHODS FOR APPROVAL SYSTEM
    List<Doctor> findByIsApprovedFalse(); // Find pending doctors
    List<Doctor> findByIsApprovedTrue(); // Find approved doctors
    List<Doctor> findByIsApprovedAndIsActive(Boolean isApproved, Boolean isActive);
    long countByIsApprovedFalse(); // Count pending doctors
}