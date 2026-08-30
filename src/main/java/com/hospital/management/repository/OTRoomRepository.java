package com.hospital.management.repository;

import com.hospital.management.entity.OTRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OTRoomRepository extends JpaRepository<OTRoom, Long> {
	boolean existsByRoomNumber(String roomNumber);

	Optional<OTRoom> findByRoomNumber(String roomNumber);
}