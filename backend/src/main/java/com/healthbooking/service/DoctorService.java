package com.healthbooking.service;

import com.healthbooking.dto.*;
import com.healthbooking.model.Doctor;
import com.healthbooking.model.DoctorAvailability;
import com.healthbooking.repository.DoctorAvailabilityRepository;
import com.healthbooking.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(DoctorDTO::from)
                .toList();
    }

    public DoctorDTO createDoctor(DoctorRequestDTO req) {
        Doctor doctor = Doctor.builder()
                .name(req.getName())
                .specialty(req.getSpecialty())
                .avatarUrl(req.getAvatarUrl())
                .build();
        return DoctorDTO.from(doctorRepository.save(doctor));
    }

    public DoctorDTO updateDoctor(Long id, DoctorRequestDTO req) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + id));
        doctor.setName(req.getName());
        doctor.setSpecialty(req.getSpecialty());
        doctor.setAvatarUrl(req.getAvatarUrl());
        return DoctorDTO.from(doctorRepository.save(doctor));
    }

    @Transactional
    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new EntityNotFoundException("Doctor not found: " + id);
        }
        doctorRepository.deleteById(id);
    }

    public List<DoctorAvailabilityDTO> getAvailability(Long doctorId) {
        return availabilityRepository
                .findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(doctorId)
                .stream()
                .map(DoctorAvailabilityDTO::from)
                .toList();
    }

    public DoctorAvailabilityDTO addAvailability(Long doctorId, DoctorAvailabilityRequestDTO req) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + doctorId));
        DoctorAvailability slot = DoctorAvailability.builder()
                .doctor(doctor)
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .build();
        return DoctorAvailabilityDTO.from(availabilityRepository.save(slot));
    }

    public void deleteAvailability(Long doctorId, Long availId) {
        DoctorAvailability slot = availabilityRepository.findById(availId)
                .orElseThrow(() -> new EntityNotFoundException("Availability slot not found: " + availId));
        if (!slot.getDoctor().getId().equals(doctorId)) {
            throw new EntityNotFoundException("Slot does not belong to doctor: " + doctorId);
        }
        availabilityRepository.deleteById(availId);
    }
}
