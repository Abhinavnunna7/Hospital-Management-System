package com.hospital.management.controller;

import com.hospital.management.dto.BedRequestDTO;
import com.hospital.management.dto.BedResponseDTO;
import com.hospital.management.dto.WardRequestDTO;
import com.hospital.management.dto.WardResponseDTO;
import com.hospital.management.enums.BedStatus;
import com.hospital.management.service.WardBedService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/infrastructure")
public class WardBedController {

	private final WardBedService wardBedService;

	public WardBedController(WardBedService wardBedService) {
		this.wardBedService = wardBedService;
	}

	@PostMapping("/wards")
	public ResponseEntity<WardResponseDTO> createWard(@RequestBody WardRequestDTO dto) {
		return new ResponseEntity<>(wardBedService.createWard(dto), HttpStatus.CREATED);
	}

	@GetMapping("/wards")
	public ResponseEntity<List<WardResponseDTO>> getAllWards() {
		return ResponseEntity.ok(wardBedService.getAllWards());
	}

	@PostMapping("/beds")
	public ResponseEntity<BedResponseDTO> addBed(@RequestBody BedRequestDTO dto) {
		return new ResponseEntity<>(wardBedService.addBed(dto), HttpStatus.CREATED);
	}

	@GetMapping("/beds/available")
	public ResponseEntity<List<BedResponseDTO>> getAvailableBeds(@RequestParam(required = false) Long wardId) {
		if (wardId != null) {
			return ResponseEntity.ok(wardBedService.getAvailableBedsByWard(wardId));
		}
		return ResponseEntity.ok(wardBedService.getAllAvailableBeds());
	}

	@PatchMapping("/beds/{bedId}/status")
	public ResponseEntity<BedResponseDTO> updateBedStatus(@PathVariable Long bedId, @RequestParam BedStatus status) {
		return ResponseEntity.ok(wardBedService.updateBedStatus(bedId, status));
	}
}