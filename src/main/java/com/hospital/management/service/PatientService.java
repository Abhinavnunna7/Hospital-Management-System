package com.hospital.management.service;

import com.hospital.management.dto.PatientDTO;
import com.hospital.management.entity.Patient;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

	private final PatientRepository patientRepository;

	public PatientService(PatientRepository patientRepository) {
		this.patientRepository = patientRepository;
	}

	public PatientDTO registerPatient(PatientDTO dto) {
		Patient patient = new Patient();
		patient.setFullName(dto.getFullName());
		patient.setAge(dto.getAge());
		patient.setGender(dto.getGender());
		patient.setBloodGroup(dto.getBloodGroup());
		patient.setContactNumber(dto.getContactNumber());
		patient.setAddress(dto.getAddress());

		Patient saved = patientRepository.save(patient);
		dto.setId(saved.getId());
		return dto;
	}

	public PatientDTO getPatientById(Long id) {
		Patient patient = patientRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
		return mapToDTO(patient);
	}

	public List<PatientDTO> getAllPatients() {
		return patientRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	private PatientDTO mapToDTO(Patient patient) {
		PatientDTO dto = new PatientDTO();
		dto.setId(patient.getId());
		dto.setFullName(patient.getFullName());
		dto.setAge(patient.getAge());
		dto.setGender(patient.getGender());
		dto.setBloodGroup(patient.getBloodGroup());
		dto.setContactNumber(patient.getContactNumber());
		dto.setAddress(patient.getAddress());
		return dto;
	}
}