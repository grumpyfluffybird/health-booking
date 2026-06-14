package com.healthbooking.dto;

import com.healthbooking.model.DoctorAvailability;
import lombok.Builder;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data @Builder
public class DoctorAvailabilityDTO {

    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    public static DoctorAvailabilityDTO from(DoctorAvailability a) {
        return builder()
                .id(a.getId())
                .dayOfWeek(a.getDayOfWeek())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .build();
    }
}
