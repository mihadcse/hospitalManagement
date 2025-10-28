package com.healthcare.demo.mapper;

import com.healthcare.demo.dto.AdminDto;
import com.healthcare.demo.models.Admin;

import java.util.List;
import java.util.stream.Collectors;

public class AdminMapper {

    public static AdminDto toDto(Admin admin) {
        if (admin == null) return null;

        return new AdminDto(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getPhone(),
                admin.getRole(),
                admin.getIsActive()
        );
    }

    public static List<AdminDto> toDtoList(List<Admin> admins) {
        return admins.stream()
                .map(AdminMapper::toDto)
                .collect(Collectors.toList());
    }

    public static Admin toEntity(AdminDto dto) {
        if (dto == null) return null;

        Admin admin = new Admin();
        admin.setId(dto.getId());
        admin.setName(dto.getName());
        admin.setEmail(dto.getEmail());
        admin.setPhone(dto.getPhone());
        admin.setRole(dto.getRole());
        admin.setIsActive(dto.getIsActive());

        return admin;
    }
}