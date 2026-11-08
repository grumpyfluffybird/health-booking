package com.healthbooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleRequestDTO {

    @NotNull(message = "Vui lòng chọn ngày khám mới.")
    private LocalDate appointmentDate;

    @NotNull(message = "Vui lòng chọn giờ khám mới.")
    private LocalTime appointmentTime;
}
