package com.hospital.management.repository;

import com.hospital.management.entity.LabOrder;
import com.hospital.management.enums.LabOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
	List<LabOrder> findByAdmissionId(Long admissionId);

	List<LabOrder> findByStatus(LabOrderStatus status);
}