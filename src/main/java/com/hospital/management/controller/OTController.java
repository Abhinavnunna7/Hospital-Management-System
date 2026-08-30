package com.hospital.management.controller;

import com.hospital.management.dto.CompleteSurgeryDTO;
import com.hospital.management.dto.OTRoomDTO;
import com.hospital.management.dto.OTScheduleRequestDTO;
import com.hospital.management.dto.OTScheduleResponseDTO;
import com.hospital.management.enums.SurgeryStatus;
import com.hospital.management.service.OTService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ot")
public class OTController {

	private final OTService otService;

	public OTController(OTService otService) {
		this.otService = otService;
	}

	@PostMapping("/rooms")
	public ResponseEntity<OTRoomDTO> createOTRoom(@RequestBody OTRoomDTO dto) {
		return new ResponseEntity<>(otService.createOTRoom(dto), HttpStatus.CREATED);
	}

	@GetMapping("/rooms")
	public ResponseEntity<List<OTRoomDTO>> getAllOTRooms() {
		return ResponseEntity.ok(otService.getAllOTRooms());
	}

	@PostMapping("/schedules")
	public ResponseEntity<OTScheduleResponseDTO> scheduleSurgery(@RequestBody OTScheduleRequestDTO dto) {
		return new ResponseEntity<>(otService.scheduleSurgery(dto), HttpStatus.CREATED);
	}

	@PatchMapping("/schedules/{id}/status")
	public ResponseEntity<OTScheduleResponseDTO> updateSurgeryStatus(@PathVariable Long id,
			@RequestParam SurgeryStatus status) {
		return ResponseEntity.ok(otService.updateSurgeryStatus(id, status));
	}

	@PatchMapping("/schedules/{id}/complete")
	public ResponseEntity<OTScheduleResponseDTO> completeSurgery(@PathVariable Long id,
			@RequestBody CompleteSurgeryDTO dto) {
		return ResponseEntity.ok(otService.completeSurgery(id, dto));
	}

	@GetMapping("/schedules/admission/{admissionId}")
	public ResponseEntity<List<OTScheduleResponseDTO>> getSchedulesByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(otService.getSchedulesByAdmission(admissionId));
	}
}