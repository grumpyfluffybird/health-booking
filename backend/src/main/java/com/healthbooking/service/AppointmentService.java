package com.healthbooking.service;

import com.healthbooking.dto.AppointmentRequestDTO;
import com.healthbooking.dto.AppointmentResponseDTO;
import com.healthbooking.dto.AppointmentStatsDTO;
import com.healthbooking.exception.BusinessException;
import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import com.healthbooking.model.Doctor;
import com.healthbooking.repository.AppointmentRepository;
import com.healthbooking.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    /** Số ngày tối đa cho một lần xem thống kê (tính cả ngày đầu và ngày cuối). */
    public static final int MAX_STATS_DAYS = 90;

    /** Các trạng thái được phép đổi lịch. */
    private static final Set<AppointmentStatus> RESCHEDULABLE =
            Set.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final SlotService slotService;

    @Transactional
    public AppointmentResponseDTO book(AppointmentRequestDTO req) {
        // Khóa bác sĩ trước khi kiểm tra chỗ trống — cùng cơ chế với reschedule().
        Doctor doctor = doctorRepository.findByIdForUpdate(req.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bác sĩ: " + req.getDoctorId()));
        slotService.assertBookable(doctor.getId(), req.getAppointmentDate(), req.getAppointmentTime());

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

    /**
     * Nhân viên đổi ngày/giờ khám. Giữ nguyên mã lịch, bác sĩ, thông tin khách và trạng thái.
     * Toàn bộ chạy trong một giao dịch: lỗi ở bất kỳ bước nào thì lịch cũ được giữ nguyên.
     */
    @Transactional
    public AppointmentResponseDTO reschedule(Long id, LocalDate newDate, LocalTime newTime) {
        Appointment appointment = appointmentRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn #" + id));

        if (!RESCHEDULABLE.contains(appointment.getStatus())) {
            throw BusinessException.conflict("STATUS_NOT_RESCHEDULABLE",
                    "Chỉ có thể đổi lịch hẹn đang Chờ xác nhận hoặc Đã xác nhận.");
        }
        LocalDateTime current = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime());
        if (!current.isAfter(slotService.now())) {
            throw BusinessException.conflict("APPOINTMENT_STARTED",
                    "Lịch hẹn đã đến hoặc đã qua giờ khám nên không thể đổi.");
        }
        if (newDate.equals(appointment.getAppointmentDate()) && newTime.equals(appointment.getAppointmentTime())) {
            return AppointmentResponseDTO.from(appointment); // không có thay đổi, không cập nhật dữ liệu
        }

        Long doctorId = appointment.getDoctor().getId();
        doctorRepository.findByIdForUpdate(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bác sĩ: " + doctorId));
        slotService.assertBookable(doctorId, newDate, newTime);

        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        return AppointmentResponseDTO.from(appointmentRepository.saveAndFlush(appointment));
    }

    /**
     * Thống kê theo ngày hẹn khám trong [from, to], bao gồm cả hai đầu. Mặc định: đầu tháng hiện tại → hôm nay
     * (theo múi giờ ứng dụng). Tổng và biểu đồ đếm mọi lịch, kể cả đã hủy.
     */
    @Transactional(readOnly = true)
    public AppointmentStatsDTO getStats(LocalDate from, LocalDate to) {
        LocalDate today = slotService.today();
        LocalDate start = from != null ? from : today.withDayOfMonth(1);
        LocalDate end = to != null ? to : today;

        if (start.isAfter(end)) {
            throw BusinessException.badRequest("INVALID_RANGE", "Từ ngày phải trước hoặc bằng Đến ngày.");
        }
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        if (days > MAX_STATS_DAYS) {
            throw BusinessException.badRequest("RANGE_TOO_LONG",
                    "Chỉ được xem tối đa " + MAX_STATS_DAYS + " ngày mỗi lần (đang chọn " + days + " ngày).");
        }

        Map<AppointmentStatus, Long> byStatus = new EnumMap<>(AppointmentStatus.class);
        Arrays.stream(AppointmentStatus.values()).forEach(s -> byStatus.put(s, 0L));
        Map<LocalDate, Long> byDate = new HashMap<>();
        long total = 0;
        for (Object[] row : appointmentRepository.countByDateAndStatus(start, end)) {
            LocalDate date = (LocalDate) row[0];
            AppointmentStatus status = (AppointmentStatus) row[1];
            long count = (Long) row[2];
            byStatus.merge(status, count, Long::sum);
            byDate.merge(date, count, Long::sum);
            total += count;
        }

        List<AppointmentStatsDTO.DailyCount> daily = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            daily.add(new AppointmentStatsDTO.DailyCount(d, byDate.getOrDefault(d, 0L)));
        }
        List<AppointmentStatsDTO.StatusCount> statusCounts = byStatus.entrySet().stream()
                .map(e -> new AppointmentStatsDTO.StatusCount(e.getKey(), e.getValue()))
                .toList();

        return new AppointmentStatsDTO(start, end, total, statusCounts, daily);
    }
}
