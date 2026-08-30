package com.hospital.management.repository;

import com.hospital.management.entity.MedicationOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicationOrderRepository extends JpaRepository<MedicationOrder, Long> {
	List<MedicationOrder> findByAdmissionId(Long admissionId);

	List<MedicationOrder> findByAdmissionIdAndIsDispensed(Long admissionId, boolean isDispensed);
}