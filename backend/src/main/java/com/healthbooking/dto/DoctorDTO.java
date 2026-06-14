package com.healthbooking.dto;

import com.healthbooking.model.Doctor;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DoctorDTO {
    private Long id;
    private String name;
    private String specialty;
    private String avatarUrl;

    public static DoctorDTO from(Doctor d) {
        return DoctorDTO.builder()
                .id(d.getId())
                .name(d.getName())
                .specialty(d.getSpecialty())
                .avatarUrl(d.getAvatarUrl())
                .build();
    }
}
