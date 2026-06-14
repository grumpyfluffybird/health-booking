package com.healthbooking.repository;

import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findAllByOrderByCreatedAtDesc();
    List<Appointment> findByStatus(AppointmentStatus status);
}
