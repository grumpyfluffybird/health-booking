package com.healthbooking.controller;

import com.healthbooking.dto.AppointmentResponseDTO;
import com.healthbooking.dto.StatusUpdateDTO;
import com.healthbooking.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}
