package com.healthbooking;

import com.healthbooking.dto.AppointmentRequestDTO;
import com.healthbooking.exception.BusinessException;
import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import com.healthbooking.service.AppointmentService;
import com.healthbooking.support.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RescheduleIntegrationTest extends IntegrationTestBase {

    @Autowired AppointmentService appointmentService;

    private String body(LocalDate date, String time) {
        return "{\"appointmentDate\":\"" + date + "\",\"appointmentTime\":\"" + time + "\"}";
    }

    private org.springframework.test.web.servlet.ResultActions reschedule(Long id, LocalDate date, String time) throws Exception {
        return mockMvc.perform(patch("/api/admin/appointments/{id}/schedule", id)
                .header("Authorization", bearer())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(date, time)));
    }

    // ── Thành công ──────────────────────────────────────────────

    @Test
    void reschedulesToValidSlotKeepingIdDoctorPatientAndStatus() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.CONFIRMED);

        reschedule(a.getId(), WED, "08:30")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(a.getId()))
                .andExpect(jsonPath("$.appointmentDate").value("2026-11-11"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.doctor.id").value(doctor.getId()));

        Appointment saved = appointmentRepository.findById(a.getId()).orElseThrow();
        assertThat(saved.getAppointmentDate()).isEqualTo(WED);
        assertThat(saved.getAppointmentTime()).isEqualTo(LocalTime.of(8, 30));
        assertThat(saved.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        assertThat(saved.getPatientName()).isEqualTo("Nguyễn Thị Khách");
        assertThat(saved.getPatientEmail()).isEqualTo("khach@example.com");
        assertThat(saved.getPatientPhone()).isEqualTo("0900000000");
        assertThat(saved.getNotes()).isEqualTo("ghi chú");
        assertThat(appointmentRepository.count()).isEqualTo(1);
    }

    @Test
    void pendingAppointmentStaysPending() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        reschedule(a.getId(), TUE, "10:00").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void cancelledAppointmentAtTargetDoesNotBlock() throws Exception {
        appointment(WED, "08:30", AppointmentStatus.CANCELLED);
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        reschedule(a.getId(), WED, "08:30").andExpect(status().isOk());
    }

    @Test
    void sameDateAndTimeIsNoOp() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        reschedule(a.getId(), TUE, "08:00").andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentDate").value("2026-11-10"));
        assertThat(activeAt(TUE, "08:00")).isEqualTo(1);
    }

    // ── Lịch không đủ điều kiện ─────────────────────────────────

    @Test
    void cancelledAppointmentCannotBeRescheduled() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.CANCELLED);
        reschedule(a.getId(), WED, "08:30")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("STATUS_NOT_RESCHEDULABLE"));
        assertUnchanged(a);
    }

    @Test
    void appointmentAlreadyStartedCannotBeRescheduled() throws Exception {
        Appointment past = appointment(MON, "08:30", AppointmentStatus.CONFIRMED);
        Appointment exactlyNow = appointment(MON, "09:00", AppointmentStatus.CONFIRMED);
        reschedule(past.getId(), WED, "08:30").andExpect(jsonPath("$.code").value("APPOINTMENT_STARTED"));
        reschedule(exactlyNow.getId(), WED, "08:30").andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("APPOINTMENT_STARTED"));
        assertUnchanged(past);
        assertUnchanged(exactlyNow);
    }

    // ── Giờ mới không hợp lệ ───────────────────────────────────

    @Test
    void cannotMoveToPastTime() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        reschedule(a.getId(), MON, "08:00")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("SLOT_IN_PAST"));
        assertUnchanged(a);
    }

    @Test
    void cannotMoveOutsideWorkingHours() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        reschedule(a.getId(), SAT, "09:00").andExpect(jsonPath("$.code").value("OUTSIDE_WORKING_HOURS"));
        reschedule(a.getId(), MON, "12:30").andExpect(jsonPath("$.code").value("OUTSIDE_WORKING_HOURS"));
        reschedule(a.getId(), TUE, "09:15").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("OUTSIDE_WORKING_HOURS"));
        assertUnchanged(a);
    }

    @Test
    void cannotMoveToFullSlotAndOldScheduleIsKept() throws Exception {
        appointment(WED, "08:30", AppointmentStatus.PENDING);
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.CONFIRMED);
        reschedule(a.getId(), WED, "08:30")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SLOT_FULL"))
                .andExpect(jsonPath("$.error").isNotEmpty());
        assertUnchanged(a);
        assertThat(activeAt(WED, "08:30")).isEqualTo(1);
    }

    @Test
    void invalidBodyIsRejected() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        mockMvc.perform(patch("/api/admin/appointments/{id}/schedule", a.getId())
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"appointmentDate\":\"2026-11-11\"}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(patch("/api/admin/appointments/{id}/schedule", 999999)
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(WED, "08:30")))
                .andExpect(status().isNotFound());
        assertUnchanged(a);
    }

    // ── Đồng thời ───────────────────────────────────────────────

    @Test
    void concurrentReschedulesToSameSlotDoNotExceedCapacity() throws Exception {
        List<Appointment> sources = new ArrayList<>();
        String[] times = {"08:00", "08:30", "09:00", "09:30", "10:00", "10:30"};
        for (String t : times) sources.add(appointment(TUE, t, AppointmentStatus.PENDING));

        List<Callable<Boolean>> tasks = new ArrayList<>();
        for (Appointment a : sources) {
            tasks.add(() -> {
                appointmentService.reschedule(a.getId(), WED, LocalTime.of(8, 30));
                return true;
            });
        }
        // Thêm một khách đặt mới cùng lúc vào cùng khung giờ
        tasks.add(() -> {
            AppointmentRequestDTO req = new AppointmentRequestDTO();
            req.setPatientName("Khách mới");
            req.setPatientPhone("0911111111");
            req.setPatientEmail("moi@example.com");
            req.setDoctorId(doctor.getId());
            req.setAppointmentDate(WED);
            req.setAppointmentTime(LocalTime.of(8, 30));
            appointmentService.book(req);
            return true;
        });

        int successes = runConcurrently(tasks);

        assertThat(successes).isEqualTo(1);
        assertThat(activeAt(WED, "08:30")).isEqualTo(1);
    }

    @Test
    void concurrentBookingsToSameSlotDoNotExceedCapacity() throws Exception {
        List<Callable<Boolean>> tasks = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            int n = i;
            tasks.add(() -> {
                AppointmentRequestDTO req = new AppointmentRequestDTO();
                req.setPatientName("Khách " + n);
                req.setPatientPhone("09000000" + n);
                req.setPatientEmail("k" + n + "@example.com");
                req.setDoctorId(doctor.getId());
                req.setAppointmentDate(TUE);
                req.setAppointmentTime(LocalTime.of(10, 0));
                appointmentService.book(req);
                return true;
            });
        }
        assertThat(runConcurrently(tasks)).isEqualTo(1);
        assertThat(activeAt(TUE, "10:00")).isEqualTo(1);
    }

    private int runConcurrently(List<Callable<Boolean>> tasks) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(tasks.size());
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<Boolean>> futures = new ArrayList<>();
            for (Callable<Boolean> task : tasks) {
                futures.add(pool.submit(() -> {
                    start.await();
                    try {
                        return task.call();
                    } catch (BusinessException e) {
                        assertThat(e.getCode()).isEqualTo("SLOT_FULL");
                        return false;
                    }
                }));
            }
            start.countDown();
            int ok = 0;
            for (Future<Boolean> f : futures) if (f.get(30, TimeUnit.SECONDS)) ok++;
            return ok;
        } finally {
            pool.shutdownNow();
        }
    }

    // ── Bảo mật & dùng chung giờ trống ──────────────────────────

    @Test
    void unauthenticatedOrInvalidTokenCannotReschedule() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        mockMvc.perform(patch("/api/admin/appointments/{id}/schedule", a.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(body(WED, "08:30")))
                .andExpect(status().is4xxClientError());
        mockMvc.perform(patch("/api/admin/appointments/{id}/schedule", a.getId())
                        .header("Authorization", "Bearer not-a-valid-token")
                        .contentType(MediaType.APPLICATION_JSON).content(body(WED, "08:30")))
                .andExpect(status().is4xxClientError());
        assertUnchanged(a);
    }

    @Test
    void slotsEndpointHidesPastTimesAndMarksFullSlots() throws Exception {
        appointment(MON, "10:00", AppointmentStatus.CONFIRMED);
        appointment(MON, "10:30", AppointmentStatus.CANCELLED);
        mockMvc.perform(get("/api/doctors/{id}/slots", doctor.getId()).param("date", MON.toString()))
                .andExpect(status().isOk())
                // Thứ Hai 08–12 & 13–17, bây giờ 09:00 → từ 09:30 trở đi: 09:30..11:30 (5) + 13:00..16:30 (8)
                .andExpect(jsonPath("$.length()").value(13))
                .andExpect(jsonPath("$[0].time").value("09:30"))
                .andExpect(jsonPath("$[1].time").value("10:00"))
                .andExpect(jsonPath("$[1].available").value(false))
                .andExpect(jsonPath("$[2].time").value("10:30"))
                .andExpect(jsonPath("$[2].available").value(true));
    }

    @Test
    void bookingRejectsFullSlot() throws Exception {
        appointment(TUE, "08:00", AppointmentStatus.PENDING);
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"patientName":"A","patientPhone":"1","patientEmail":"a@b.vn",
                                 "doctorId":%d,"appointmentDate":"2026-11-10","appointmentTime":"08:00"}
                                """.formatted(doctor.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SLOT_FULL"));
    }

    private void assertUnchanged(Appointment before) {
        Appointment now = appointmentRepository.findById(before.getId()).orElseThrow();
        assertThat(now.getAppointmentDate()).isEqualTo(before.getAppointmentDate());
        assertThat(now.getAppointmentTime()).isEqualTo(before.getAppointmentTime());
        assertThat(now.getStatus()).isEqualTo(before.getStatus());
    }
}
