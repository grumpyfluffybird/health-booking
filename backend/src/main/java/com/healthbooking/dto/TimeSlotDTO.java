package com.healthbooking.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;

/** Một khung giờ khám trong ngày và số chỗ còn lại. */
public record TimeSlotDTO(
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        int remaining,
        boolean available) {
}
