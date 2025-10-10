package com.healthcare.demo.services;

import com.healthcare.demo.enums.Status;
import com.healthcare.demo.models.Admin;
import com.healthcare.demo.models.Appointment;
import com.healthcare.demo.models.Doctor;
import com.healthcare.demo.models.Patient;
import com.healthcare.demo.repositories.AdminRepository;
import com.healthcare.demo.repositories.AppointmentRepository;
import com.healthcare.demo.repositories.DoctorRepository;
import com.healthcare.demo.repositories.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminService(AdminRepository adminRepository,
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository,
                        AppointmentRepository appointmentRepository) {
        this.adminRepository = adminRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // ==================== ADMIN MANAGEMENT ====================
    public Admin registerAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    // ==================== USER MANAGEMENT ====================

    // Get all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get all doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Get patient by ID
    public Patient getPatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));
    }

    // Get doctor by ID
    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
    }

    // Delete patient
    public void deletePatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));
        patientRepository.delete(patient);
    }

    // Delete doctor
    public void deleteDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
        doctorRepository.delete(doctor);
    }

    // ==================== APPOINTMENT MANAGEMENT ====================

    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Cancel any appointment (admin override)
    public void cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));
        appointment.setStatus(Status.Cancelled);
        appointmentRepository.save(appointment);
    }

    // Delete appointment permanently
    public void deleteAppointment(Long appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }

    // ==================== SYSTEM STATISTICS ====================

    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // User counts
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAdmins = adminRepository.count();

        // Appointment counts
        List<Appointment> allAppointments = appointmentRepository.findAll();
        long totalAppointments = allAppointments.size();
        long scheduledAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == Status.Scheduled)
                .count();
        long completedAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == Status.Completed)
                .count();
        long cancelledAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == Status.Cancelled)
                .count();

        // Today's appointments
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        long todaysAppointments = allAppointments.stream()
                .filter(a -> a.getAppointmentDateTime().isAfter(startOfDay)
                        && a.getAppointmentDateTime().isBefore(endOfDay))
                .count();

        stats.put("totalUsers", totalPatients + totalDoctors + totalAdmins);
        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalAppointments", totalAppointments);
        stats.put("scheduledAppointments", scheduledAppointments);
        stats.put("completedAppointments", completedAppointments);
        stats.put("cancelledAppointments", cancelledAppointments);
        stats.put("todaysAppointments", todaysAppointments);

        return stats;
    }

    // Get recent appointments (last 10)
    public List<Appointment> getRecentAppointments(int limit) {
        return appointmentRepository.findAll().stream()
                .sorted((a1, a2) -> a2.getAppointmentDateTime().compareTo(a1.getAppointmentDateTime()))
                .limit(limit)
                .toList();
    }
}