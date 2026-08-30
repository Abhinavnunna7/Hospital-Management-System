package com.hospital.management.controller;

import com.hospital.management.dto.DoctorDTO;
import com.hospital.management.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

	private final DoctorService doctorService;

	public DoctorController(DoctorService doctorService) {
		this.doctorService = doctorService;
	}

	@PostMapping
	public ResponseEntity<DoctorDTO> addDoctor(@RequestBody DoctorDTO dto) {
		return new ResponseEntity<>(doctorService.addDoctor(dto), HttpStatus.CREATED);
	}

	@GetMapping("/{id}")
	public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
		return ResponseEntity.ok(doctorService.getDoctorById(id));
	}

	@GetMapping
	public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
		return ResponseEntity.ok(doctorService.getAllDoctors());
	}
}