package com.healthbooking.service;

import com.healthbooking.dto.TimeSlotDTO;
import com.healthbooking.exception.BusinessException;
import com.healthbooking.model.AppointmentStatus;
import com.healthbooking.model.DoctorAvailability;
import com.healthbooking.repository.AppointmentRepository;
import com.healthbooking.repository.DoctorAvailabilityRepository;
import com.healthbooking.repository.DoctorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Nguồn duy nhất cho cách tính khung giờ khám, dùng chung cho đặt lịch và đổi lịch.
 * <ul>
 *   <li>Khung giờ: chia mỗi ca làm việc của bác sĩ thành các mốc cách nhau 30 phút, bắt đầu từ
 *       giờ bắt đầu ca; mốc cuối phải nhỏ hơn giờ kết thúc ca (giống cách tính cũ ở frontend).</li>
 *   <li>Sức chứa: mỗi khung giờ nhận tối đa {@code app.booking.slot-capacity} lịch chưa hủy (mặc định 1).</li>
 *   <li>"Bây giờ" lấy theo múi giờ ứng dụng (xem {@code TimeConfig}).</li>
 * </ul>
 */
@Service
public class SlotService {

    public static final int SLOT_MINUTES = 30;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final Clock clock;
    private final int slotCapacity;

    public SlotService(DoctorRepository doctorRepository,
                       DoctorAvailabilityRepository availabilityRepository,
                       AppointmentRepository appointmentRepository,
                       Clock clock,
                       @Value("${app.booking.slot-capacity:1}") int slotCapacity) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.appointmentRepository = appointmentRepository;
        this.clock = clock;
        this.slotCapacity = Math.max(1, slotCapacity);
    }

    public LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    public LocalDate today() {
        return LocalDate.now(clock);
    }

    /** Các mốc giờ làm việc của bác sĩ trong ngày (chưa xét lịch đã đặt). */
    public List<LocalTime> workingSlots(Long doctorId, LocalDate date) {
        List<LocalTime> slots = new ArrayList<>();
        for (DoctorAvailability w : availabilityRepository
                .findByDoctorIdAndDayOfWeekOrderByStartTimeAsc(doctorId, date.getDayOfWeek())) {
            LocalTime t = w.getStartTime();
            while (t.isBefore(w.getEndTime())) {
                slots.add(t);
                LocalTime next = t.plusMinutes(SLOT_MINUTES);
                if (!next.isAfter(t)) break; // vượt qua nửa đêm
                t = next;
            }
        }
        return slots.stream().distinct().sorted().toList();
    }

    /** Các khung giờ chưa qua trong ngày, kèm số chỗ còn lại. */
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getSlots(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new EntityNotFoundException("Không tìm thấy bác sĩ: " + doctorId);
        }
        Map<LocalTime, Long> booked = new HashMap<>();
        for (Object[] row : appointmentRepository.countBookedByTime(doctorId, date, AppointmentStatus.CANCELLED)) {
            booked.put((LocalTime) row[0], (Long) row[1]);
        }
        LocalDateTime now = now();
        return workingSlots(doctorId, date).stream()
                .filter(t -> LocalDateTime.of(date, t).isAfter(now))
                .map(t -> {
                    int remaining = (int) Math.max(0, slotCapacity - booked.getOrDefault(t, 0L));
                    return new TimeSlotDTO(t, remaining, remaining > 0);
                })
                .toList();
    }

    /**
     * Kiểm tra có thể nhận thêm một lịch tại (date, time) hay không. Phải được gọi trong giao dịch
     * đã khóa dòng bác sĩ bằng {@link DoctorRepository#findByIdForUpdate} để kết quả đếm không lỗi thời.
     *
     * @throws BusinessException kèm lý do cụ thể nếu không hợp lệ
     */
    public void assertBookable(Long doctorId, LocalDate date, LocalTime time) {
        String when = time.format(TIME_FMT) + " ngày " + date.format(DATE_FMT);
        if (!LocalDateTime.of(date, time).isAfter(now())) {
            throw BusinessException.badRequest("SLOT_IN_PAST",
                    "Thời điểm " + when + " đã qua. Vui lòng chọn ngày giờ trong tương lai.");
        }
        if (!workingSlots(doctorId, date).contains(time)) {
            throw BusinessException.badRequest("OUTSIDE_WORKING_HOURS",
                    "Bác sĩ không có lịch làm việc lúc " + when + ". Vui lòng chọn khung giờ khác.");
        }
        long taken = appointmentRepository.countByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                doctorId, date, time, AppointmentStatus.CANCELLED);
        if (taken >= slotCapacity) {
            throw BusinessException.conflict("SLOT_FULL",
                    "Khung giờ " + when + " đã hết chỗ (có thể vừa được người khác đặt). Vui lòng chọn khung giờ khác.");
        }
    }
}
