package com.healthcare.demo.mapper;
import com.healthcare.demo.dto.AppointmentDto;
import com.healthcare.demo.dto.DoctorDto;
import com.healthcare.demo.dto.PatientDto;
import com.healthcare.demo.models.Appointment;
import com.healthcare.demo.models.Doctor;
import com.healthcare.demo.models.Patient;

import java.util.List;
import java.util.stream.Collectors;

public class AppointmentMapper {

    public static AppointmentDto toDto(Appointment appointment) {
        if (appointment == null) return null;

        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();

        DoctorDto doctorDto = new DoctorDto(
                doctor.getName(),
                doctor.getSpecialty(),
                doctor.getAvailableDays(),
                doctor.getAvailableFrom(),
                doctor.getAvailableTo()
        );

        PatientDto patientDto = new PatientDto(
                patient.getId(),
                patient.getName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getImageUrl()
        );

        return new AppointmentDto(
                appointment.getId(),
                appointment.getAppointmentDateTime(),
                doctorDto,
                patientDto,
                appointment.getStatus().name()
        );
    }

    public static List<AppointmentDto> toDtoList(List<Appointment> appointments) {
        return appointments.stream()
                .map(AppointmentMapper::toDto)
                .collect(Collectors.toList());
    }
}

