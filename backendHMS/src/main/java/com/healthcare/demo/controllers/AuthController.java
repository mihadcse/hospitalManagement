package com.healthcare.demo.controllers;

import com.healthcare.demo.models.Admin;
import com.healthcare.demo.models.Patient;
import com.healthcare.demo.models.Doctor;
import com.healthcare.demo.repositories.AdminRepository;
import com.healthcare.demo.repositories.PatientRepository;
import com.healthcare.demo.repositories.DoctorRepository;
import com.healthcare.demo.services.AdminService;
import com.healthcare.demo.services.AuthService;
import com.healthcare.demo.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ------------------------ RECORDS FOR RESPONSE ------------------------
    record ErrorResponse(String message, int statusCode) {}
    record SuccessResponse(String message) {}
    record AuthResponse(String accessToken, String refreshToken, Long id, String userType, String name) {}

    // ------------------------ REGISTER PATIENT ------------------------
    @PostMapping("/register/patient")
    public ResponseEntity<Object> registerPatient(@RequestBody Patient patient) {
        if (patientRepository.findByEmail(patient.getEmail()) != null) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Email already registered!", HttpStatus.CONFLICT.value()));
        }
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        authService.registerPatient(patient);
        return ResponseEntity.ok(new SuccessResponse("Patient Registered Successfully!"));
    }

    // ------------------------ REGISTER DOCTOR ------------------------
    @PostMapping("/register/doctor")
    public ResponseEntity<Object> registerDoctor(@RequestBody Doctor doctor) {
        if (doctorRepository.findByEmail(doctor.getEmail()) != null) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Email already registered!", HttpStatus.CONFLICT.value()));
        }
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        authService.registerDoctor(doctor);
        return ResponseEntity.ok(new SuccessResponse("Doctor Registered Successfully! Waiting for admin approval."));
    }

    // ------------------------ REGISTER ADMIN ------------------------
    @PostMapping("/register/admin")
    public ResponseEntity<Object> registerAdmin(@RequestBody Admin admin) {
        if (adminRepository.existsByEmail(admin.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Email already registered!", HttpStatus.CONFLICT.value()));
        }
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        adminService.registerAdmin(admin);
        return ResponseEntity.ok(new SuccessResponse("Admin Registered Successfully!"));
    }

    // ------------------------ LOGIN PATIENT ------------------------
    @PostMapping("/login/patient")
    public ResponseEntity<Object> loginPatient(@RequestBody Patient patient) {
        Patient existingPatient = patientRepository.findByEmail(patient.getEmail());
        if (existingPatient != null && passwordEncoder.matches(patient.getPassword(), existingPatient.getPassword())) {
            String accessToken = jwtUtil.generateAccessToken(existingPatient.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(existingPatient.getEmail());

            return ResponseEntity.ok(new AuthResponse(
                    accessToken,
                    refreshToken,
                    existingPatient.getId(),
                    "patient",
                    existingPatient.getName()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
    }

    // ------------------------ LOGIN DOCTOR (UPDATED WITH APPROVAL CHECK) ------------------------
    // ------------------------ LOGIN DOCTOR (FIXED VERSION) ------------------------
    @PostMapping("/login/doctor")
    public ResponseEntity<Object> loginDoctor(@RequestBody Doctor doctor) {
        Doctor existingDoctor = doctorRepository.findByEmail(doctor.getEmail());

        if (existingDoctor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
        }

        // CRITICAL FIX: Check password FIRST before checking approval status
        if (!passwordEncoder.matches(doctor.getPassword(), existingDoctor.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
        }

        // CHECK IF DOCTOR IS REJECTED (isApproved=false AND isActive=false)
        if (Boolean.FALSE.equals(existingDoctor.getIsApproved()) &&
                Boolean.FALSE.equals(existingDoctor.getIsActive())) {

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Your registration has been rejected by admin.");
            response.put("status", "ACCOUNT_REJECTED");
            response.put("rejectionReason", existingDoctor.getRejectionReason() != null
                    ? existingDoctor.getRejectionReason()
                    : "No reason provided");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // CHECK IF DOCTOR IS PENDING (isApproved=false AND isActive=true)
        if (Boolean.FALSE.equals(existingDoctor.getIsApproved()) &&
                Boolean.TRUE.equals(existingDoctor.getIsActive())) {

            Map<String, String> response = new HashMap<>();
            response.put("message", "Your registration is pending admin approval. Please wait for confirmation.");
            response.put("status", "PENDING_APPROVAL");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // CHECK IF DOCTOR IS INACTIVE (but approved)
        if (Boolean.FALSE.equals(existingDoctor.getIsActive())) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Your account has been deactivated. Please contact admin.");
            response.put("status", "ACCOUNT_INACTIVE");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // All checks passed - generate tokens
        String accessToken = jwtUtil.generateAccessToken(existingDoctor.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(existingDoctor.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                accessToken,
                refreshToken,
                existingDoctor.getId(),
                "doctor",
                existingDoctor.getName()
        ));
    }

    // ------------------------ LOGIN ADMIN ------------------------
    @PostMapping("/login/admin")
    public ResponseEntity<Object> loginAdmin(@RequestBody Admin admin) {
        Admin existingAdmin = adminRepository.findByEmail(admin.getEmail());
        if (existingAdmin != null &&
                existingAdmin.getIsActive() &&
                passwordEncoder.matches(admin.getPassword(), existingAdmin.getPassword())) {

            String accessToken = jwtUtil.generateAccessToken(existingAdmin.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(existingAdmin.getEmail());

            return ResponseEntity.ok(new AuthResponse(
                    accessToken,
                    refreshToken,
                    existingAdmin.getId(),
                    "admin",
                    existingAdmin.getName()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials or Account Inactive");
    }

    // ------------------------ REFRESH TOKEN ------------------------
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || !jwtUtil.validateToken(refreshToken, jwtUtil.extractUsername(refreshToken))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired refresh token");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(username);

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("refreshToken", refreshToken);

        return ResponseEntity.ok(response);
    }
}