package com.healthbooking.repository;

import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findAllByOrderByCreatedAtDesc();
    List<Appointment> findByStatus(AppointmentStatus status);

    /** Khóa dòng lịch hẹn (SELECT ... FOR UPDATE) để đổi lịch an toàn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Appointment a where a.id = :id")
    Optional<Appointment> findByIdForUpdate(@Param("id") Long id);

    /** Số lịch đang chiếm chỗ (trạng thái khác {@code excluded}, thường là CANCELLED) tại một khung giờ của bác sĩ. */
    long countByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long doctorId, LocalDate date, LocalTime time, AppointmentStatus excluded);

    /** Số lịch đang chiếm chỗ theo từng giờ trong một ngày của bác sĩ: [LocalTime, Long]. */
    @Query("""
            select a.appointmentTime, count(a) from Appointment a
            where a.doctor.id = :doctorId and a.appointmentDate = :date and a.status <> :excluded
            group by a.appointmentTime
            """)
    List<Object[]> countBookedByTime(@Param("doctorId") Long doctorId,
                                     @Param("date") LocalDate date,
                                     @Param("excluded") AppointmentStatus excluded);

    /** Số lịch theo ngày hẹn khám và trạng thái trong khoảng [from, to]: [LocalDate, AppointmentStatus, Long]. */
    @Query("""
            select a.appointmentDate, a.status, count(a) from Appointment a
            where a.appointmentDate between :from and :to
            group by a.appointmentDate, a.status
            """)
    List<Object[]> countByDateAndStatus(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
