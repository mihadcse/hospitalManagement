package com.healthcare.demo.dto;

import com.healthcare.demo.models.Appointment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponseDto {
    private SystemStatsDto statistics;
    private List<AppointmentDto> recentAppointments;
    private Map<String, Long> appointmentsByStatus;
    private Map<String, Long> appointmentsBySpecialty;
}