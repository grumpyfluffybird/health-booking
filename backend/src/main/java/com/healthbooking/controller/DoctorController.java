package com.healthbooking.controller;

import com.healthbooking.dto.DoctorAvailabilityDTO;
import com.healthbooking.dto.DoctorDTO;
import com.healthbooking.dto.TimeSlotDTO;
import com.healthbooking.service.DoctorService;
import com.healthbooking.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final SlotService slotService;

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<DoctorAvailabilityDTO>> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getAvailability(id));
    }

    /** Khung giờ chưa qua của bác sĩ trong một ngày kèm số chỗ còn lại — dùng chung cho đặt lịch và đổi lịch. */
    @GetMapping("/{id}/slots")
    public ResponseEntity<List<TimeSlotDTO>> getSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(slotService.getSlots(id, date));
    }
}
