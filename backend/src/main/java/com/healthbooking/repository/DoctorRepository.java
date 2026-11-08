package com.healthbooking.repository;

import com.healthbooking.model.Doctor;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    /**
     * Khóa dòng bác sĩ (SELECT ... FOR UPDATE). Đặt lịch và đổi lịch đều gọi hàm này trước khi
     * đếm chỗ trống, nên các yêu cầu cùng bác sĩ được tuần tự hóa và không thể vượt sức chứa.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Doctor d where d.id = :id")
    Optional<Doctor> findByIdForUpdate(@Param("id") Long id);
}
