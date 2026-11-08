package com.healthbooking;

import com.healthbooking.model.Appointment;
import com.healthbooking.model.AppointmentStatus;
import com.healthbooking.support.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AppointmentStatsIntegrationTest extends IntegrationTestBase {

    private static final LocalDate NOV_1 = LocalDate.of(2026, 11, 1);
    private static final LocalDate NOV_5 = LocalDate.of(2026, 11, 5);

    private ResultActions stats(LocalDate from, LocalDate to) throws Exception {
        var req = get("/api/admin/appointments/stats").header("Authorization", bearer());
        if (from != null) req.param("from", from.toString());
        if (to != null) req.param("to", to.toString());
        return mockMvc.perform(req);
    }

    @Test
    void countsEachStatusAndTotalIncludingCancelled() throws Exception {
        appointment(NOV_1, "08:00", AppointmentStatus.PENDING);
        appointment(NOV_1, "08:30", AppointmentStatus.PENDING);
        appointment(NOV_1, "09:00", AppointmentStatus.CONFIRMED);
        appointment(LocalDate.of(2026, 11, 3), "09:00", AppointmentStatus.CANCELLED);
        appointment(NOV_5, "09:00", AppointmentStatus.CONFIRMED);

        stats(NOV_1, NOV_5)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.byStatus[?(@.status=='PENDING')].count").value(2))
                .andExpect(jsonPath("$.byStatus[?(@.status=='CONFIRMED')].count").value(2))
                .andExpect(jsonPath("$.byStatus[?(@.status=='CANCELLED')].count").value(1))
                .andExpect(jsonPath("$.byStatus", hasSize(AppointmentStatus.values().length)));
    }

    @Test
    void includesBoundaryDaysAndExcludesOutside() throws Exception {
        appointment(LocalDate.of(2026, 10, 31), "16:30", AppointmentStatus.PENDING); // trước khoảng
        appointment(NOV_1, "08:00", AppointmentStatus.PENDING);                      // ngày đầu
        appointment(NOV_5, "16:30", AppointmentStatus.PENDING);                      // ngày cuối, giờ muộn
        appointment(LocalDate.of(2026, 11, 6), "08:00", AppointmentStatus.PENDING);  // sau khoảng

        stats(NOV_1, NOV_5)
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.daily", hasSize(5)))
                .andExpect(jsonPath("$.daily[0].date").value("2026-11-01"))
                .andExpect(jsonPath("$.daily[0].count").value(1))
                .andExpect(jsonPath("$.daily[4].date").value("2026-11-05"))
                .andExpect(jsonPath("$.daily[4].count").value(1));
    }

    @Test
    void daysWithoutAppointmentsAreZero() throws Exception {
        appointment(NOV_1, "08:00", AppointmentStatus.CONFIRMED);
        appointment(NOV_1, "08:30", AppointmentStatus.CANCELLED);
        stats(NOV_1, NOV_5)
                .andExpect(jsonPath("$.daily[0].count").value(2)) // tính cả lịch đã hủy
                .andExpect(jsonPath("$.daily[1].count").value(0))
                .andExpect(jsonPath("$.daily[2].count").value(0))
                .andExpect(jsonPath("$.daily[3].count").value(0))
                .andExpect(jsonPath("$.daily[4].count").value(0));
    }

    @Test
    void rescheduledAppointmentMovesToNewDay() throws Exception {
        Appointment a = appointment(TUE, "08:00", AppointmentStatus.PENDING);
        stats(MON, WED).andExpect(jsonPath("$.daily[1].count").value(1))
                .andExpect(jsonPath("$.daily[2].count").value(0));

        mockMvc.perform(patch("/api/admin/appointments/{id}/schedule", a.getId())
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"appointmentDate\":\"2026-11-11\",\"appointmentTime\":\"08:30\"}"))
                .andExpect(status().isOk());

        stats(MON, WED)
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.daily[1].count").value(0))
                .andExpect(jsonPath("$.daily[2].count").value(1));
    }

    @Test
    void emptyRangeReturnsZeros() throws Exception {
        stats(NOV_1, NOV_5)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.byStatus[?(@.status=='PENDING')].count").value(0))
                .andExpect(jsonPath("$.daily", hasSize(5)))
                .andExpect(jsonPath("$.daily[2].count").value(0));
    }

    @Test
    void defaultsToStartOfMonthUntilToday() throws Exception {
        stats(null, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from").value("2026-11-01"))
                .andExpect(jsonPath("$.to").value("2026-11-09"))
                .andExpect(jsonPath("$.daily", hasSize(9)));
    }

    @Test
    void rejectsInvalidRanges() throws Exception {
        stats(NOV_5, NOV_1).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_RANGE"));
        stats(NOV_1, NOV_1.plusDays(90)).andExpect(status().isBadRequest()) // 91 ngày
                .andExpect(jsonPath("$.code").value("RANGE_TOO_LONG"));
        stats(NOV_1, NOV_1.plusDays(89)).andExpect(status().isOk())          // đúng 90 ngày
                .andExpect(jsonPath("$.daily", hasSize(90)));
        mockMvc.perform(get("/api/admin/appointments/stats").header("Authorization", bearer())
                        .param("from", "01/11/2026"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void statsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/appointments/stats"))
                .andExpect(status().is4xxClientError());
        mockMvc.perform(get("/api/admin/appointments/stats").header("Authorization", "Bearer bad"))
                .andExpect(status().is4xxClientError());
    }
}
