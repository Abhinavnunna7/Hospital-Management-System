package com.hospital.management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.management.dto.BulkPrescriptionDTO;
import com.hospital.management.dto.MedicationAdministrationDTO;
import com.hospital.management.dto.MedicationPrescriptionDTO;
import com.hospital.management.dto.MedicationResponseDTO;
import com.hospital.management.service.MedicationService;

@RestController
@RequestMapping("/api/mar")
public class MedicationController {

	private final MedicationService medicationService;

	public MedicationController(MedicationService medicationService) {
		this.medicationService = medicationService;
	}

	@PostMapping("/prescriptions")
	public ResponseEntity<MedicationResponseDTO> prescribeMedication(@RequestBody MedicationPrescriptionDTO dto) {
		return new ResponseEntity<>(medicationService.prescribeMedication(dto), HttpStatus.CREATED);
	}

	@PatchMapping("/orders/{id}/administer")
	public ResponseEntity<MedicationResponseDTO> administerMedication(@PathVariable Long id,
			@RequestBody MedicationAdministrationDTO dto) {
		return ResponseEntity.ok(medicationService.administerMedication(id, dto));
	}

	@GetMapping("/admissions/{admissionId}")
	public ResponseEntity<List<MedicationResponseDTO>> getMedicationsByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(medicationService.getMedicationsByAdmission(admissionId));
	}

	@GetMapping("/admissions/{admissionId}/pending")
	public ResponseEntity<List<MedicationResponseDTO>> getPendingMedicationsByAdmission(
			@PathVariable Long admissionId) {
		return ResponseEntity.ok(medicationService.getPendingMedicationsByAdmission(admissionId));
	}
	
	@PostMapping("/prescriptions/bulk")
	public ResponseEntity<List<MedicationResponseDTO>> prescribeMultipleMedications(@RequestBody BulkPrescriptionDTO dto) {
	    return new ResponseEntity<>(medicationService.prescribeMultipleMedications(dto), HttpStatus.CREATED);
	}
}