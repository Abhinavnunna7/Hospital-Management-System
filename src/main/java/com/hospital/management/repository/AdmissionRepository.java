package com.hospital.management.repository;

import com.hospital.management.entity.Admission;
import com.hospital.management.enums.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
	List<Admission> findByStatus(AdmissionStatus status);

	Optional<Admission> findByPatientIdAndStatus(Long patientId, AdmissionStatus status);
}