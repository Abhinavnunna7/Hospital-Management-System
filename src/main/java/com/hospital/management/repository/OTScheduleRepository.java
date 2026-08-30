package com.hospital.management.repository;

import com.hospital.management.entity.OTSchedule;
import com.hospital.management.enums.SurgeryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OTScheduleRepository extends JpaRepository<OTSchedule, Long> {

	List<OTSchedule> findByAdmissionId(Long admissionId);

	@Query("SELECT s FROM OTSchedule s WHERE s.otRoom.id = :roomId " + "AND s.status != 'CANCELLED' "
			+ "AND (:newStart < s.endTime AND :newEnd > s.startTime)")
	List<OTSchedule> findOverlappingSchedules(@Param("roomId") Long roomId, @Param("newStart") LocalDateTime newStart,
			@Param("newEnd") LocalDateTime newEnd);
}