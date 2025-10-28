package com.healthcare.demo.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthcare.demo.enums.Specialty;
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Getter
    private String email;

    private String phone;

    @Setter
    @Getter
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Specialty specialty;

    @OneToMany(mappedBy = "doctor")
    @JsonIgnore
    private List<Appointment> appointments;

    @ElementCollection(targetClass = DayOfWeek.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "doctor_available_days", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "available_day")
    private Set<DayOfWeek> availableDays;

    private LocalTime availableFrom;
    private LocalTime availableTo;

    // NEW FIELDS FOR APPROVAL SYSTEM
    @Column(nullable = false)
    private Boolean isApproved = false; // Default to false - requires admin approval

    @Column(nullable = false)
    private Boolean isActive = true; // Can be deactivated by admin

    private LocalDateTime registrationDate;

    private LocalDateTime approvalDate;

    private String approvedBy; // Admin email who approved

    private String rejectionReason; // If rejected, why?

    @PrePersist
    protected void onCreate() {
        registrationDate = LocalDateTime.now();
    }
}