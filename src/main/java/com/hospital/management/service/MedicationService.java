package com.hospital.management.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.management.dto.BulkPrescriptionDTO;
import com.hospital.management.dto.MedicationAdministrationDTO;
import com.hospital.management.dto.MedicationPrescriptionDTO;
import com.hospital.management.dto.MedicationResponseDTO;
import com.hospital.management.entity.Admission;
import com.hospital.management.entity.MedicationOrder;
import com.hospital.management.enums.AdmissionStatus;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AdmissionRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.MedicationOrderRepository;
import com.hospital.management.repository.UserRepository;

@Service
public class MedicationService {

	private final MedicationOrderRepository medicationOrderRepository;
	private final AdmissionRepository admissionRepository;
	private final DoctorRepository doctorRepository;
	private final UserRepository userRepository;

	public MedicationService(MedicationOrderRepository medicationOrderRepository,
			AdmissionRepository admissionRepository, DoctorRepository doctorRepository, UserRepository userRepository) {
		this.medicationOrderRepository = medicationOrderRepository;
		this.admissionRepository = admissionRepository;
		this.doctorRepository = doctorRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public MedicationResponseDTO prescribeMedication(MedicationPrescriptionDTO dto) {
		Admission admission = admissionRepository.findById(dto.getAdmissionId()).orElseThrow(
				() -> new ResourceNotFoundException("Admission not found with ID: " + dto.getAdmissionId()));

		if (admission.getStatus() != AdmissionStatus.ADMITTED) {
			throw new IllegalStateException("Cannot prescribe medication for an inactive or discharged admission.");
		}

		if (!doctorRepository.existsById(dto.getDoctorId())) {
			throw new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId());
		}

		MedicationOrder order = new MedicationOrder();
		order.setAdmissionId(dto.getAdmissionId());
		order.setDoctorId(dto.getDoctorId());
		order.setMedicineName(dto.getMedicineName());
		order.setDosage(dto.getDosage());
		order.setRoute(dto.getRoute());
		order.setFrequency(dto.getFrequency());
		order.setUnitPrice(dto.getUnitPrice());
		order.setDispensed(false);
		order.setPrescribedAt(LocalDateTime.now());

		MedicationOrder saved = medicationOrderRepository.save(order);
		return mapToDTO(saved);
	}

	@Transactional
	public MedicationResponseDTO administerMedication(Long orderId, MedicationAdministrationDTO dto) {
		MedicationOrder order = medicationOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Medication order not found with ID: " + orderId));

		if (order.isDispensed()) {
			throw new IllegalStateException("This medication dose has already been administered.");
		}

		if (!userRepository.existsById(dto.getNurseId())) {
			throw new ResourceNotFoundException("Staff/Nurse user not found with ID: " + dto.getNurseId());
		}

		order.setDispensed(true);
		order.setAdministeredByNurseId(dto.getNurseId());
		order.setAdministeredAt(LocalDateTime.now());
		order.setAdministrationNotes(dto.getAdministrationNotes());

		MedicationOrder updated = medicationOrderRepository.save(order);
		return mapToDTO(updated);
	}

	public List<MedicationResponseDTO> getMedicationsByAdmission(Long admissionId) {
		return medicationOrderRepository.findByAdmissionId(admissionId).stream().map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	public List<MedicationResponseDTO> getPendingMedicationsByAdmission(Long admissionId) {
		return medicationOrderRepository.findByAdmissionIdAndIsDispensed(admissionId, false).stream()
				.map(this::mapToDTO).collect(Collectors.toList());
	}

	private MedicationResponseDTO mapToDTO(MedicationOrder order) {
		MedicationResponseDTO dto = new MedicationResponseDTO();
		dto.setId(order.getId());
		dto.setAdmissionId(order.getAdmissionId());
		dto.setDoctorId(order.getDoctorId());
		dto.setMedicineName(order.getMedicineName());
		dto.setDosage(order.getDosage());
		dto.setRoute(order.getRoute());
		dto.setFrequency(order.getFrequency());
		dto.setUnitPrice(order.getUnitPrice());
		dto.setDispensed(order.isDispensed());
		dto.setAdministeredByNurseId(order.getAdministeredByNurseId());
		dto.setAdministeredAt(order.getAdministeredAt());
		dto.setAdministrationNotes(order.getAdministrationNotes());
		dto.setPrescribedAt(order.getPrescribedAt());
		return dto;
	}
	
	
	@Transactional
	public List<MedicationResponseDTO> prescribeMultipleMedications(BulkPrescriptionDTO bulkDto) {
	    Admission admission = admissionRepository.findById(bulkDto.getAdmissionId())
	            .orElseThrow(() -> new ResourceNotFoundException("Admission not found with ID: " + bulkDto.getAdmissionId()));

	    if (admission.getStatus() != AdmissionStatus.ADMITTED) {
	        throw new IllegalStateException("Cannot prescribe medication for an inactive or discharged admission.");
	    }

	    if (!doctorRepository.existsById(bulkDto.getDoctorId())) {
	        throw new ResourceNotFoundException("Doctor not found with ID: " + bulkDto.getDoctorId());
	    }

	    List<MedicationOrder> orders = bulkDto.getMedicines().stream().map(item -> {
	        MedicationOrder order = new MedicationOrder();
	        order.setAdmissionId(bulkDto.getAdmissionId());
	        order.setDoctorId(bulkDto.getDoctorId());
	        order.setMedicineName(item.getMedicineName());
	        order.setDosage(item.getDosage());
	        order.setRoute(item.getRoute());
	        order.setFrequency(item.getFrequency());
	        order.setUnitPrice(item.getUnitPrice());
	        order.setDispensed(false);
	        order.setPrescribedAt(LocalDateTime.now());
	        return order;
	    }).collect(Collectors.toList());

	    List<MedicationOrder> saved = medicationOrderRepository.saveAll(orders);
	    return saved.stream().map(this::mapToDTO).collect(Collectors.toList());
	}
}