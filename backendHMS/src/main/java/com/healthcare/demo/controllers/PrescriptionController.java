
package com.healthcare.demo.controllers;

import com.healthcare.demo.dto.PrescriptionDTO;
import com.healthcare.demo.models.Prescription;
import com.healthcare.demo.repositories.PrescriptionRepository;
import com.healthcare.demo.services.PrescriptionService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*") // Added CORS support for frontend
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionController(PrescriptionService prescriptionService, PrescriptionRepository prescriptionRepository) {
        this.prescriptionService = prescriptionService;
        this.prescriptionRepository = prescriptionRepository;
    }

    @GetMapping("/patient/{id}")
    public List<PrescriptionDTO> getByPatient(@PathVariable Long id) {
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatientId(id);

        // map entities → DTOs (avoiding fileData in JSON)
        return prescriptions.stream().map(p -> {
            PrescriptionDTO dto = new PrescriptionDTO();
            dto.setId(p.getId());
            dto.setDoctorId(p.getDoctorId());
            dto.setPatientId(p.getPatientId());
            dto.setNotes(p.getNotes());
            dto.setFileName(p.getFileName());
            dto.setFileType(p.getFileType());
            return dto;
        }).toList();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPrescription(
            @RequestParam Long doctorId,
            @RequestParam Long patientId,
            @RequestParam(required = false) String notes, // Made notes optional
            @RequestParam MultipartFile file) {

        try {
            // Added validation logging
            System.out.println("Upload request received:");
            System.out.println("Doctor ID: " + doctorId);
            System.out.println("Patient ID: " + patientId);
            System.out.println("Notes: " + notes);
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());

            // Validate file is not empty
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // FIXED: Validate file size (e.g., max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size exceeds 10MB limit");
            }

            Prescription prescription = new Prescription();
            prescription.setDoctorId(doctorId);
            prescription.setPatientId(patientId);
            prescription.setNotes(notes != null ? notes : ""); // FIXED: Handle null notes
            prescription.setFileName(file.getOriginalFilename());
            prescription.setFileType(file.getContentType());
            prescription.setFileData(file.getBytes());

            Prescription saved = prescriptionRepository.save(prescription);
            System.out.println("Prescription saved with ID: " + saved.getId());

            return ResponseEntity.ok("Uploaded successfully");
        } catch (IOException e) {
            // FIXED: Better error handling for IO exceptions
            System.err.println("IO Error during file upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading file: " + e.getMessage());
        } catch (Exception e) {
            // FIXED: Log full stack trace for debugging
            System.err.println("Error during prescription upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // Get All Prescriptions
    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getAll() {
        // FIXED: Return DTOs instead of full entities to avoid fileData serialization
        List<Prescription> prescriptions = prescriptionService.getAllPrescriptions();
        List<PrescriptionDTO> dtos = prescriptions.stream().map(p -> {
            PrescriptionDTO dto = new PrescriptionDTO();
            dto.setId(p.getId());
            dto.setDoctorId(p.getDoctorId());
            dto.setPatientId(p.getPatientId());
            dto.setNotes(p.getNotes());
            dto.setFileName(p.getFileName());
            dto.setFileType(p.getFileType());
            return dto;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    // Get Prescription by ID
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getById(@PathVariable Long id) {
        // FIXED: Return DTO instead of full entity
        Prescription p = prescriptionService.getPrescriptionById(id);
        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(p.getId());
        dto.setDoctorId(p.getDoctorId());
        dto.setPatientId(p.getPatientId());
        dto.setNotes(p.getNotes());
        dto.setFileName(p.getFileName());
        dto.setFileType(p.getFileType());
        return ResponseEntity.ok(dto);
    }

    // Download Prescription File
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadPrescription(@PathVariable Long id) {
        try {
            Prescription prescription = prescriptionService.getPrescriptionById(id);

            // FIXED: Validate file data exists
            if (prescription.getFileData() == null || prescription.getFileData().length == 0) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + prescription.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(prescription.getFileType()))
                    .body(prescription.getFileData());
        } catch (Exception e) {
            // FIXED: Log and handle errors
            System.err.println("Error downloading prescription: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete Prescription
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            prescriptionService.deletePrescription(id);
            return ResponseEntity.ok("Prescription deleted successfully");
        } catch (Exception e) {
            // FIXED: Better error handling
            System.err.println("Error deleting prescription: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting prescription: " + e.getMessage());
        }
    }
}