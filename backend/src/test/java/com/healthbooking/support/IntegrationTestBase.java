package com.healthbooking.support;

import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import com.healthbooking.model.Doctor;
import com.healthbooking.repository.AppointmentRepository;
import com.healthbooking.repository.DoctorRepository;
import com.healthbooking.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

/**
 * Nền chung cho integration test: H2 (chế độ PostgreSQL) + migration Flyway thật + đồng hồ cố định.
 * "Bây giờ" = Thứ Hai 09/11/2026 09:00 (Asia/Ho_Chi_Minh).
 * Bác sĩ "Dr. Nguyen Van An" (seed V4) làm việc: T2 08–12 & 13–17, T3 08–12, T4 08–12 & 13–17, T5 08–12, T6 08–11:30.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(IntegrationTestBase.FixedClockConfig.class)
public abstract class IntegrationTestBase {

    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 9, 9, 0);

    public static final LocalDate MON = LocalDate.of(2026, 11, 9);
    public static final LocalDate TUE = LocalDate.of(2026, 11, 10);
    public static final LocalDate WED = LocalDate.of(2026, 11, 11);
    public static final LocalDate SAT = LocalDate.of(2026, 11, 14);

    @TestConfiguration
    public static class FixedClockConfig {
        @Bean
        @Primary
        public Clock fixedTestClock() {
            return Clock.fixed(NOW.atZone(ZONE).toInstant(), ZONE);
        }
    }

    @Autowired protected MockMvc mockMvc;
    @Autowired protected AppointmentRepository appointmentRepository;
    @Autowired protected DoctorRepository doctorRepository;
    @Autowired protected JwtService jwtService;

    protected Doctor doctor;

    @BeforeEach
    void resetData() {
        appointmentRepository.deleteAll();
        doctor = doctorRepository.findAll().stream()
                .filter(d -> d.getName().equals("Dr. Nguyen Van An"))
                .findFirst().orElseThrow();
    }

    protected String bearer() {
        return "Bearer " + jwtService.generateToken("admin");
    }

    protected Appointment appointment(LocalDate date, String time, AppointmentStatus status) {
        return appointmentRepository.save(Appointment.builder()
                .patientName("Nguyễn Thị Khách")
                .patientPhone("0900000000")
                .patientEmail("khach@example.com")
                .doctor(doctor)
                .appointmentDate(date)
                .appointmentTime(LocalTime.parse(time))
                .status(status)
                .notes("ghi chú")
                .build());
    }

    protected long activeAt(LocalDate date, String time) {
        return appointmentRepository.countByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                doctor.getId(), date, LocalTime.parse(time), AppointmentStatus.CANCELLED);
    }
}
