package com.healthcare.demo.services;

import com.healthcare.demo.dto.PatientDto;
import com.healthcare.demo.models.Patient;
import com.healthcare.demo.repositories.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    private final String uploadDir = "uploads/patient-images/";

    // 🧠 Save or update patient info
    public PatientDto updatePatient(Long id, PatientDto dto, MultipartFile imageFile) throws IOException {
        Optional<Patient> optionalPatient = patientRepository.findById(id);
        if (optionalPatient.isEmpty()) {
            throw new RuntimeException("Patient not found with ID: " + id);
        }

        Patient patient = optionalPatient.get();

        // update info
        if (dto.getName() != null) patient.setName(dto.getName());
        if (dto.getEmail() != null) patient.setEmail(dto.getEmail());
        if (dto.getPhone() != null) patient.setPhone(dto.getPhone());

        // 🖼️ handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = id + "_" + imageFile.getOriginalFilename();
            File filePath = new File(uploadDir + fileName);
            imageFile.transferTo(filePath);

            String imageUrl = "/images/patient/" + fileName;
            patient.setImageUrl(imageUrl);
        }

        Patient updated = patientRepository.save(patient);

        return new PatientDto(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getPhone(),
                updated.getImageUrl()
        );
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return new PatientDto(patient.getId(), patient.getName(), patient.getEmail(), patient.getPhone(), patient.getImageUrl());
    }
}
