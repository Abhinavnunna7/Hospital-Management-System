package com.hospital.management.controller;

import com.hospital.management.dto.AdmissionRequestDTO;
import com.hospital.management.dto.AdmissionResponseDTO;
import com.hospital.management.dto.DischargeRequestDTO;
import com.hospital.management.service.AdmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

	private final AdmissionService admissionService;

	public AdmissionController(AdmissionService admissionService) {
		this.admissionService = admissionService;
	}

	@PostMapping
	public ResponseEntity<AdmissionResponseDTO> admitPatient(@RequestBody AdmissionRequestDTO dto) {
		return new ResponseEntity<>(admissionService.admitPatient(dto), HttpStatus.CREATED);
	}

	@PatchMapping("/{id}/discharge")
	public ResponseEntity<AdmissionResponseDTO> dischargePatient(@PathVariable Long id,
			@RequestBody DischargeRequestDTO dto) {
		return ResponseEntity.ok(admissionService.dischargePatient(id, dto));
	}

	@GetMapping("/{id}")
	public ResponseEntity<AdmissionResponseDTO> getAdmissionById(@PathVariable Long id) {
		return ResponseEntity.ok(admissionService.getAdmissionById(id));
	}

	@GetMapping("/active")
	public ResponseEntity<List<AdmissionResponseDTO>> getActiveAdmissions() {
		return ResponseEntity.ok(admissionService.getActiveAdmissions());
	}
}