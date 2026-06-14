package com.healthbooking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String specialty;

    private String avatarUrl;
}
