package com.hospital.management.service;

import com.hospital.management.dto.AdmissionRequestDTO;
import com.hospital.management.dto.AdmissionResponseDTO;
import com.hospital.management.dto.DischargeRequestDTO;
import com.hospital.management.entity.Admission;
import com.hospital.management.entity.Bed;
import com.hospital.management.enums.AdmissionStatus;
import com.hospital.management.enums.BedStatus;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AdmissionRepository;
import com.hospital.management.repository.BedRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdmissionService {

	private final AdmissionRepository admissionRepository;
	private final BedRepository bedRepository;
	private final PatientRepository patientRepository;
	private final DoctorRepository doctorRepository;

	public AdmissionService(AdmissionRepository admissionRepository, BedRepository bedRepository,
			PatientRepository patientRepository, DoctorRepository doctorRepository) {
		this.admissionRepository = admissionRepository;
		this.bedRepository = bedRepository;
		this.patientRepository = patientRepository;
		this.doctorRepository = doctorRepository;
	}

	@Transactional
	public AdmissionResponseDTO admitPatient(AdmissionRequestDTO dto) {
		if (!patientRepository.existsById(dto.getPatientId())) {
			throw new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId());
		}
		if (!doctorRepository.existsById(dto.getDoctorId())) {
			throw new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId());
		}

		admissionRepository.findByPatientIdAndStatus(dto.getPatientId(), AdmissionStatus.ADMITTED).ifPresent(a -> {
			throw new IllegalStateException("Patient is already admitted with Admission ID: " + a.getId());
		});

		Bed bed = bedRepository.findByIdWithLock(dto.getBedId())
				.orElseThrow(() -> new ResourceNotFoundException("Bed not found with ID: " + dto.getBedId()));

		if (bed.getStatus() != BedStatus.AVAILABLE) {
			throw new IllegalStateException("Bed " + bed.getBedNumber() + " is currently " + bed.getStatus());
		}

		bed.setStatus(BedStatus.OCCUPIED);
		bedRepository.save(bed);

		Admission admission = new Admission();
		admission.setPatientId(dto.getPatientId());
		admission.setDoctorId(dto.getDoctorId());
		admission.setBed(bed);
		admission.setAdmissionTime(LocalDateTime.now());
		admission.setStatus(AdmissionStatus.ADMITTED);
		admission.setDiagnosis(dto.getDiagnosis());

		Admission saved = admissionRepository.save(admission);
		return mapToDTO(saved);
	}

	@Transactional
	public AdmissionResponseDTO dischargePatient(Long admissionId, DischargeRequestDTO dto) {
		Admission admission = admissionRepository.findById(admissionId)
				.orElseThrow(() -> new ResourceNotFoundException("Admission record not found with ID: " + admissionId));

		if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
			throw new IllegalStateException("Patient is already discharged.");
		}

		Bed bed = admission.getBed();
		Bed lockedBed = bedRepository.findByIdWithLock(bed.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Bed not found with ID: " + bed.getId()));

		lockedBed.setStatus(BedStatus.AVAILABLE);
		bedRepository.save(lockedBed);

		admission.setStatus(AdmissionStatus.DISCHARGED);
		admission.setDischargeTime(LocalDateTime.now());
		admission.setDischargeNotes(dto.getDischargeNotes());

		Admission updated = admissionRepository.save(admission);
		return mapToDTO(updated);
	}

	public AdmissionResponseDTO getAdmissionById(Long id) {
		Admission admission = admissionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Admission record not found with ID: " + id));
		return mapToDTO(admission);
	}

	public List<AdmissionResponseDTO> getActiveAdmissions() {
		return admissionRepository.findByStatus(AdmissionStatus.ADMITTED).stream().map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	private AdmissionResponseDTO mapToDTO(Admission admission) {
		AdmissionResponseDTO dto = new AdmissionResponseDTO();
		dto.setId(admission.getId());
		dto.setPatientId(admission.getPatientId());
		dto.setDoctorId(admission.getDoctorId());
		dto.setBedId(admission.getBed().getId());
		dto.setBedNumber(admission.getBed().getBedNumber());
		dto.setWardName(admission.getBed().getWard().getName());
		dto.setAdmissionTime(admission.getAdmissionTime());
		dto.setDischargeTime(admission.getDischargeTime());
		dto.setStatus(admission.getStatus());
		dto.setDiagnosis(admission.getDiagnosis());
		dto.setDischargeNotes(admission.getDischargeNotes());
		return dto;
	}
}