package com.healthbooking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Múi giờ thống nhất của ứng dụng. Ngày/giờ hẹn khám được lưu dạng DATE/TIME không kèm múi giờ
 * và được hiểu theo múi giờ này (mặc định Asia/Ho_Chi_Minh).
 */
@Configuration
public class TimeConfig {

    @Bean
    public Clock appClock(@Value("${app.timezone:Asia/Ho_Chi_Minh}") String zone) {
        return Clock.system(ZoneId.of(zone));
    }
}
