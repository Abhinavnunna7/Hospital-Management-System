package com.hospital.management.repository;

import com.hospital.management.entity.Bed;
import com.hospital.management.enums.BedStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BedRepository extends JpaRepository<Bed, Long> {

	boolean existsByBedNumber(String bedNumber);

	List<Bed> findByStatus(BedStatus status);

	List<Bed> findByWardIdAndStatus(Long wardId, BedStatus status);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT b FROM Bed b WHERE b.id = :bedId")
	Optional<Bed> findByIdWithLock(@Param("bedId") Long bedId);
}