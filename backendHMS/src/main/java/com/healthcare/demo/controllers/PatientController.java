package com.healthcare.demo.controllers;

import com.healthcare.demo.dto.PatientDto;
import com.healthcare.demo.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/patient")
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
}
