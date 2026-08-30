package com.hospital.management.repository;

import com.hospital.management.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {
	boolean existsByTestName(String testName);

	Optional<LabTest> findByTestName(String testName);
}