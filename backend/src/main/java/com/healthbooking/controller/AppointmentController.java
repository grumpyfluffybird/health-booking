package com.healthbooking.controller;

import com.healthbooking.dto.AppointmentRequestDTO;
import com.healthbooking.dto.AppointmentResponseDTO;
import com.healthbooking.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> book(@Valid @RequestBody AppointmentRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.book(req));
    }
}
