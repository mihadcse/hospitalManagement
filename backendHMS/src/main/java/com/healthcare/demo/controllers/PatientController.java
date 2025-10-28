package com.healthcare.demo.controllers;

import com.healthcare.demo.dto.PatientDto;
import com.healthcare.demo.enums.Specialty;
import com.healthcare.demo.models.Doctor;
import com.healthcare.demo.services.DoctorService;
import com.healthcare.demo.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/patient")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    // 🔹 GET patient profile
    @GetMapping("/{id}")
    public PatientDto getPatient(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    // 🔹 UPDATE patient profile (email, phone, image)
    @PutMapping("/{id}/update")
    public PatientDto updatePatient(
            @PathVariable Long id,
            @ModelAttribute PatientDto patientDto,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws Exception {
        return patientService.updatePatient(id, patientDto, imageFile);
    }

    private final DoctorService doctorService;

    public PatientController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/doctors/getalldoctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable Specialty specialty) {
        List<Doctor> doctors = doctorService.getDoctorsBySpecialty(specialty);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors/available")
    public ResponseEntity<List<Doctor>> getAvailableDoctors(
            @RequestParam Specialty specialty,
            @RequestParam(required = false) String dayOfWeek
    ) {
        List<Doctor> doctors = doctorService.getDoctorsBySpecialtyAndDay(specialty, dayOfWeek);
        return ResponseEntity.ok(doctors);
    }
}
