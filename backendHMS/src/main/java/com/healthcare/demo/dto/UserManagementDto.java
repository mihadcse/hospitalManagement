package com.healthcare.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserManagementDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String userType; // "patient", "doctor", "admin"
    private String status; // "active", "inactive"
    private String specialty; // for doctors only
    private Integer appointmentCount; // total appointments
}