package com.healthcare.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SystemStatsDto {
    // User statistics
    private Long totalUsers;
    private Long totalPatients;
    private Long totalDoctors;
    private Long totalAdmins;

    // Appointment statistics
    private Long totalAppointments;
    private Long scheduledAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long todaysAppointments;

    // Additional metrics
    private Double averageAppointmentsPerDoctor;
    private Double averageAppointmentsPerPatient;
}