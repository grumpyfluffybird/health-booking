package com.healthbooking.dto;

import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder
public class AppointmentResponseDTO {
    private Long id;
    private String patientName;
    private String patientPhone;
    private String patientEmail;
    private DoctorDTO doctor;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;

    public static AppointmentResponseDTO from(Appointment a) {
        return AppointmentResponseDTO.builder()
                .id(a.getId())
                .patientName(a.getPatientName())
                .patientPhone(a.getPatientPhone())
                .patientEmail(a.getPatientEmail())
                .doctor(DoctorDTO.from(a.getDoctor()))
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
