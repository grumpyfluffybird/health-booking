package com.healthbooking.config;

import com.healthbooking.model.Admin;
import com.healthbooking.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.findByUsername("admin").isEmpty()) {
            adminRepository.save(Admin.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .build());
        }
    }
}
