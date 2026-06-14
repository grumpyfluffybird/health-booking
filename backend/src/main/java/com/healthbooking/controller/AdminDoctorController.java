package com.healthbooking.controller;

import com.healthbooking.dto.*;
import com.healthbooking.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<DoctorDTO> create(@Valid @RequestBody DoctorRequestDTO req) {
        return ResponseEntity.ok(doctorService.createDoctor(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequestDTO req) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<DoctorAvailabilityDTO>> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getAvailability(id));
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<DoctorAvailabilityDTO> addAvailability(
            @PathVariable Long id,
            @Valid @RequestBody DoctorAvailabilityRequestDTO req) {
        return ResponseEntity.ok(doctorService.addAvailability(id, req));
    }

    @DeleteMapping("/{id}/availability/{availId}")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable Long id,
            @PathVariable Long availId) {
        doctorService.deleteAvailability(id, availId);
        return ResponseEntity.noContent().build();
    }
}
