package com.healthbooking.controller;

import com.healthbooking.dto.AppointmentResponseDTO;
import com.healthbooking.dto.AppointmentStatsDTO;
import com.healthbooking.dto.RescheduleRequestDTO;
import com.healthbooking.dto.StatusUpdateDTO;
import com.healthbooking.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AppointmentService appointmentService;

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<AppointmentResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, dto.getStatus()));
    }

    /** Nhân viên đổi ngày/giờ khám (giữ nguyên mã lịch, bác sĩ, thông tin khách và trạng thái). */
    @PatchMapping("/appointments/{id}/schedule")
    public ResponseEntity<AppointmentResponseDTO> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequestDTO dto) {
        return ResponseEntity.ok(appointmentService.reschedule(id, dto.getAppointmentDate(), dto.getAppointmentTime()));
    }

    /** Thống kê lịch hẹn theo ngày hẹn khám; mặc định từ đầu tháng hiện tại đến hôm nay. */
    @GetMapping("/appointments/stats")
    public ResponseEntity<AppointmentStatsDTO> stats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(appointmentService.getStats(from, to));
    }
}
