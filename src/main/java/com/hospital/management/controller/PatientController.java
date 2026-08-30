package com.hospital.management.controller;

import com.hospital.management.dto.PatientDTO;
import com.hospital.management.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

	private final PatientService patientService;

	public PatientController(PatientService patientService) {
		this.patientService = patientService;
	}

	@PostMapping
	public ResponseEntity<PatientDTO> registerPatient(@RequestBody PatientDTO dto) {
		return new ResponseEntity<>(patientService.registerPatient(dto), HttpStatus.CREATED);
	}

	@GetMapping("/{id}")
	public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
		return ResponseEntity.ok(patientService.getPatientById(id));
	}

	@GetMapping
	public ResponseEntity<List<PatientDTO>> getAllPatients() {
		return ResponseEntity.ok(patientService.getAllPatients());
	}
}