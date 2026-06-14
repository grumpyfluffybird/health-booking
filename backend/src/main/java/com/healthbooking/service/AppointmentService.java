package com.healthbooking.service;

import com.healthbooking.dto.AppointmentRequestDTO;
import com.healthbooking.dto.AppointmentResponseDTO;
import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import com.healthbooking.model.Doctor;
import com.healthbooking.repository.AppointmentRepository;
import com.healthbooking.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public AppointmentResponseDTO book(AppointmentRequestDTO req) {
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + req.getDoctorId()));

        Appointment appointment = Appointment.builder()
                .patientName(req.getPatientName())
                .patientPhone(req.getPatientPhone())
                .patientEmail(req.getPatientEmail())
                .doctor(doctor)
                .appointmentDate(req.getAppointmentDate())
                .appointmentTime(req.getAppointmentTime())
                .notes(req.getNotes())
                .build();

        return AppointmentResponseDTO.from(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AppointmentResponseDTO::from)
                .toList();
    }

    @Transactional
    public AppointmentResponseDTO updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + id));
        appointment.setStatus(status);
        return AppointmentResponseDTO.from(appointmentRepository.save(appointment));
    }
}
