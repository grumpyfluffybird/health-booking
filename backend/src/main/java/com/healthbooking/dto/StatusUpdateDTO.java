package com.healthbooking.dto;

import com.healthbooking.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateDTO {
    @NotNull
    private AppointmentStatus status;
}
