package com.healthcare.demo.dto;

import com.healthcare.demo.models.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Admin.AdminRole role;
    private Boolean isActive;
    // Note: password is excluded for security
}