package com.healthbooking.dto;

import com.healthbooking.model.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;

/**
 * Thống kê lịch hẹn theo ngày hẹn khám trong khoảng [from, to] (bao gồm cả hai đầu).
 * byStatus luôn liệt kê đủ mọi trạng thái của hệ thống nên tổng các nhóm bằng total.
 */
public record AppointmentStatsDTO(
        LocalDate from,
        LocalDate to,
        long total,
        List<StatusCount> byStatus,
        List<DailyCount> daily) {

    public record StatusCount(AppointmentStatus status, long count) {
    }

    public record DailyCount(LocalDate date, long count) {
    }
}
