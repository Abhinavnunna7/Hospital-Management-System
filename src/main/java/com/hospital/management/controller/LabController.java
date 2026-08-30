package com.hospital.management.controller;

import com.hospital.management.dto.LabOrderRequestDTO;
import com.hospital.management.dto.LabOrderResponseDTO;
import com.hospital.management.dto.LabResultPublishDTO;
import com.hospital.management.dto.LabTestDTO;
import com.hospital.management.enums.LabOrderStatus;
import com.hospital.management.service.LabService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab")
public class LabController {

	private final LabService labService;

	public LabController(LabService labService) {
		this.labService = labService;
	}

	@PostMapping("/tests")
	public ResponseEntity<LabTestDTO> createLabTest(@RequestBody LabTestDTO dto) {
		return new ResponseEntity<>(labService.createLabTest(dto), HttpStatus.CREATED);
	}

	@GetMapping("/tests")
	public ResponseEntity<List<LabTestDTO>> getAllLabTests() {
		return ResponseEntity.ok(labService.getAllLabTests());
	}

	@PostMapping("/orders")
	public ResponseEntity<LabOrderResponseDTO> createLabOrder(@RequestBody LabOrderRequestDTO dto) {
		return new ResponseEntity<>(labService.createLabOrder(dto), HttpStatus.CREATED);
	}

	@PatchMapping("/orders/{id}/status")
	public ResponseEntity<LabOrderResponseDTO> updateOrderStatus(@PathVariable Long id,
			@RequestParam LabOrderStatus status) {
		return ResponseEntity.ok(labService.updateOrderStatus(id, status));
	}

	@PatchMapping("/orders/{id}/results")
	public ResponseEntity<LabOrderResponseDTO> publishResults(@PathVariable Long id,
			@RequestBody LabResultPublishDTO dto) {
		return ResponseEntity.ok(labService.publishResults(id, dto));
	}

	@GetMapping("/orders/admission/{admissionId}")
	public ResponseEntity<List<LabOrderResponseDTO>> getOrdersByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(labService.getOrdersByAdmission(admissionId));
	}
}