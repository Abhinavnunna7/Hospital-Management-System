package com.hospital.management.service;

import com.hospital.management.dto.DoctorDTO;
import com.hospital.management.entity.Doctor;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

	private final DoctorRepository doctorRepository;

	public DoctorService(DoctorRepository doctorRepository) {
		this.doctorRepository = doctorRepository;
	}

	public DoctorDTO addDoctor(DoctorDTO dto) {
		if (doctorRepository.existsByEmail(dto.getEmail())) {
			throw new IllegalStateException("Doctor with email " + dto.getEmail() + " already exists.");
		}

		Doctor doctor = new Doctor();
		doctor.setName(dto.getName());
		doctor.setSpecialization(dto.getSpecialization());
		doctor.setDepartment(dto.getDepartment());
		doctor.setContactNumber(dto.getContactNumber());
		doctor.setEmail(dto.getEmail());

		Doctor saved = doctorRepository.save(doctor);
		dto.setId(saved.getId());
		return dto;
	}

	public DoctorDTO getDoctorById(Long id) {
		Doctor doctor = doctorRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
		return mapToDTO(doctor);
	}

	public List<DoctorDTO> getAllDoctors() {
		return doctorRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	private DoctorDTO mapToDTO(Doctor doctor) {
		DoctorDTO dto = new DoctorDTO();
		dto.setId(doctor.getId());
		dto.setName(doctor.getName());
		dto.setSpecialization(doctor.getSpecialization());
		dto.setDepartment(doctor.getDepartment());
		dto.setContactNumber(doctor.getContactNumber());
		dto.setEmail(doctor.getEmail());
		return dto;
	}
}