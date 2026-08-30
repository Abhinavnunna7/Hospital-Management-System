package com.hospital.management.repository;

import com.hospital.management.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
	boolean existsByEmail(String email);

	Optional<Doctor> findByEmail(String email);
}