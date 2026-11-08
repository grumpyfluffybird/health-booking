package com.healthbooking.repository;

import com.healthbooking.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(Long doctorId);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeekOrderByStartTimeAsc(Long doctorId, DayOfWeek dayOfWeek);
}
