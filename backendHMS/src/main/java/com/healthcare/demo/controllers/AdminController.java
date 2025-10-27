package com.healthcare.demo.controllers;

import com.healthcare.demo.dto.AdminDto;
import com.healthcare.demo.dto.AppointmentDto;
import com.healthcare.demo.mapper.AdminMapper;
import com.healthcare.demo.mapper.AppointmentMapper;
import com.healthcare.demo.models.Admin;
import com.healthcare.demo.models.Appointment;
import com.healthcare.demo.models.Doctor;
import com.healthcare.demo.models.Patient;
import com.healthcare.demo.repositories.AdminRepository;
import com.healthcare.demo.services.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(AdminService adminService,
                           AdminRepository adminRepository,
                           PasswordEncoder passwordEncoder) {
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==================== SEED DEFAULT ADMIN ====================

    @PostMapping("/seed")
    public ResponseEntity<String> seedAdmin() {
        if (adminRepository.existsByEmail("admin@healthcare.com")) {
            return ResponseEntity.ok("Admin already exists.");
        }

        Admin admin = new Admin();
        admin.setName("System Administrator");
        admin.setEmail("admin@healthcare.com");
        admin.setPhone("01700000000");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Admin.AdminRole.SUPER_ADMIN);
        admin.setIsActive(true);

        adminService.registerAdmin(admin);

        return ResponseEntity.ok("✅ Default admin created successfully!\nEmail: admin@healthcare.com\nPassword: admin123");
    }

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        List<Patient> patients = adminService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = adminService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long patientId) {
        try {
            Patient patient = adminService.getPatientById(patientId);
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long doctorId) {
        try {
            Doctor doctor = adminService.getDoctorById(doctorId);
            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<String> deletePatient(@PathVariable Long patientId) {
        try {
            adminService.deletePatient(patientId);
            return ResponseEntity.ok("Patient deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Patient not found: " + e.getMessage());
        }
    }

    @DeleteMapping("/doctors/{doctorId}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long doctorId) {
        try {
            adminService.deleteDoctor(doctorId);
            return ResponseEntity.ok("Doctor deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Doctor not found: " + e.getMessage());
        }
    }

    // ==================== DOCTOR APPROVAL SYSTEM ====================

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Doctor>> getPendingDoctors() {
        List<Doctor> pendingDoctors = adminService.getPendingDoctors();
        return ResponseEntity.ok(pendingDoctors);
    }

    @GetMapping("/doctors/approved")
    public ResponseEntity<List<Doctor>> getApprovedDoctors() {
        List<Doctor> approvedDoctors = adminService.getApprovedDoctors();
        return ResponseEntity.ok(approvedDoctors);
    }

    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<Map<String, Object>> approveDoctor(
            @PathVariable Long doctorId,
            @RequestHeader("Authorization") String token) {
        try {
            // Extract admin email from token or use a default
            String adminEmail = "admin@healthcare.com"; // You can extract from JWT if needed

            Doctor approvedDoctor = adminService.approveDoctor(doctorId, adminEmail);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor approved successfully",
                    "doctor", approvedDoctor
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Doctor not found: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<Map<String, Object>> rejectDoctor(
            @PathVariable Long doctorId,
            @RequestBody Map<String, String> payload) {
        try {
            String rejectionReason = payload.getOrDefault("reason", "No reason provided");

            Doctor rejectedDoctor = adminService.rejectDoctor(doctorId, rejectionReason);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor registration rejected",
                    "doctor", rejectedDoctor
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Doctor not found: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/doctors/{doctorId}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleDoctorStatus(@PathVariable Long doctorId) {
        try {
            Doctor doctor = adminService.toggleDoctorActiveStatus(doctorId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor status updated",
                    "isActive", doctor.getIsActive(),
                    "doctor", doctor
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Doctor not found: " + e.getMessage()
                    ));
        }
    }

    @GetMapping("/doctors/pending/count")
    public ResponseEntity<Map<String, Long>> getPendingDoctorCount() {
        long count = adminService.getPendingDoctorCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ==================== APPOINTMENT MANAGEMENT ====================

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
        List<Appointment> appointments = adminService.getAllAppointments();
        List<AppointmentDto> dtos = appointments.stream()
                .map(AppointmentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/appointments/recent")
    public ResponseEntity<List<AppointmentDto>> getRecentAppointments(
            @RequestParam(defaultValue = "10") int limit) {
        List<Appointment> appointments = adminService.getRecentAppointments(limit);
        List<AppointmentDto> dtos = appointments.stream()
                .map(AppointmentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            adminService.cancelAppointment(appointmentId);
            return ResponseEntity.ok("Appointment cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found: " + e.getMessage());
        }
    }

    @DeleteMapping("/appointments/{appointmentId}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long appointmentId) {
        try {
            adminService.deleteAppointment(appointmentId);
            return ResponseEntity.ok("Appointment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting appointment: " + e.getMessage());
        }
    }

    // ==================== STATISTICS & DASHBOARD ====================

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        Map<String, Object> stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(stats);
    }
}