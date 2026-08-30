package com.hospital.management.service;

import com.hospital.management.dto.LabOrderRequestDTO;
import com.hospital.management.dto.LabOrderResponseDTO;
import com.hospital.management.dto.LabResultPublishDTO;
import com.hospital.management.dto.LabTestDTO;
import com.hospital.management.entity.Admission;
import com.hospital.management.entity.LabOrder;
import com.hospital.management.entity.LabTest;
import com.hospital.management.enums.AdmissionStatus;
import com.hospital.management.enums.LabOrderStatus;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AdmissionRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.LabOrderRepository;
import com.hospital.management.repository.LabTestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabService {

	private final LabTestRepository labTestRepository;
	private final LabOrderRepository labOrderRepository;
	private final AdmissionRepository admissionRepository;
	private final DoctorRepository doctorRepository;

	public LabService(LabTestRepository labTestRepository, LabOrderRepository labOrderRepository,
			AdmissionRepository admissionRepository, DoctorRepository doctorRepository) {
		this.labTestRepository = labTestRepository;
		this.labOrderRepository = labOrderRepository;
		this.admissionRepository = admissionRepository;
		this.doctorRepository = doctorRepository;
	}

	public LabTestDTO createLabTest(LabTestDTO dto) {
		if (labTestRepository.existsByTestName(dto.getTestName())) {
			throw new IllegalStateException("Lab test '" + dto.getTestName() + "' already exists.");
		}
		LabTest labTest = new LabTest();
		labTest.setTestName(dto.getTestName());
		labTest.setPrice(dto.getPrice());

		LabTest saved = labTestRepository.save(labTest);
		dto.setId(saved.getId());
		return dto;
	}

	public List<LabTestDTO> getAllLabTests() {
		return labTestRepository.findAll().stream().map(t -> {
			LabTestDTO dto = new LabTestDTO();
			dto.setId(t.getId());
			dto.setTestName(t.getTestName());
			dto.setPrice(t.getPrice());
			return dto;
		}).collect(Collectors.toList());
	}

	@Transactional
	public LabOrderResponseDTO createLabOrder(LabOrderRequestDTO dto) {
		Admission admission = admissionRepository.findById(dto.getAdmissionId()).orElseThrow(
				() -> new ResourceNotFoundException("Admission not found with ID: " + dto.getAdmissionId()));

		if (admission.getStatus() != AdmissionStatus.ADMITTED) {
			throw new IllegalStateException("Cannot create lab order for an inactive or discharged admission.");
		}

		if (!doctorRepository.existsById(dto.getDoctorId())) {
			throw new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId());
		}

		LabTest test = labTestRepository.findById(dto.getTestId())
				.orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + dto.getTestId()));

		LabOrder order = new LabOrder();
		order.setAdmissionId(dto.getAdmissionId());
		order.setDoctorId(dto.getDoctorId());
		order.setTest(test);
		order.setPriority(dto.getPriority());
		order.setStatus(LabOrderStatus.PENDING);
		order.setOrderedAt(LocalDateTime.now());

		LabOrder saved = labOrderRepository.save(order);
		return mapToDTO(saved);
	}

	@Transactional
	public LabOrderResponseDTO updateOrderStatus(Long orderId, LabOrderStatus status) {
		LabOrder order = labOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Lab order not found with ID: " + orderId));

		if (order.getStatus() == LabOrderStatus.COMPLETED) {
			throw new IllegalStateException("Order is already completed.");
		}

		order.setStatus(status);
		LabOrder updated = labOrderRepository.save(order);
		return mapToDTO(updated);
	}

	@Transactional
	public LabOrderResponseDTO publishResults(Long orderId, LabResultPublishDTO dto) {
		LabOrder order = labOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Lab order not found with ID: " + orderId));

		if (order.getStatus() == LabOrderStatus.CANCELLED) {
			throw new IllegalStateException("Cannot publish results for a cancelled order.");
		}

		order.setResultFindings(dto.getResultFindings());
		order.setStatus(LabOrderStatus.COMPLETED);
		order.setCompletedAt(LocalDateTime.now());

		LabOrder saved = labOrderRepository.save(order);
		return mapToDTO(saved);
	}

	public List<LabOrderResponseDTO> getOrdersByAdmission(Long admissionId) {
		return labOrderRepository.findByAdmissionId(admissionId).stream().map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	private LabOrderResponseDTO mapToDTO(LabOrder order) {
		LabOrderResponseDTO dto = new LabOrderResponseDTO();
		dto.setId(order.getId());
		dto.setAdmissionId(order.getAdmissionId());
		dto.setDoctorId(order.getDoctorId());
		dto.setTestId(order.getTest().getId());
		dto.setTestName(order.getTest().getTestName());
		dto.setPrice(order.getTest().getPrice());
		dto.setPriority(order.getPriority());
		dto.setStatus(order.getStatus());
		dto.setResultFindings(order.getResultFindings());
		dto.setOrderedAt(order.getOrderedAt());
		dto.setCompletedAt(order.getCompletedAt());
		return dto;
	}
}