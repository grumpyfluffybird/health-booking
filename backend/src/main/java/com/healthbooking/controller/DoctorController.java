package com.healthbooking.controller;

import com.healthbooking.dto.DoctorAvailabilityDTO;
import com.healthbooking.dto.DoctorDTO;
import com.healthbooking.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<DoctorAvailabilityDTO>> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getAvailability(id));
    }
}
