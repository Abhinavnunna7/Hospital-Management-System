package com.hospital.management.service;

import com.hospital.management.dto.CompleteSurgeryDTO;
import com.hospital.management.dto.OTRoomDTO;
import com.hospital.management.dto.OTScheduleRequestDTO;
import com.hospital.management.dto.OTScheduleResponseDTO;
import com.hospital.management.entity.Admission;
import com.hospital.management.entity.OTRoom;
import com.hospital.management.entity.OTSchedule;
import com.hospital.management.enums.AdmissionStatus;
import com.hospital.management.enums.SurgeryStatus;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.AdmissionRepository;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.OTRoomRepository;
import com.hospital.management.repository.OTScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OTService {

	private final OTRoomRepository otRoomRepository;
	private final OTScheduleRepository otScheduleRepository;
	private final AdmissionRepository admissionRepository;
	private final DoctorRepository doctorRepository;

	public OTService(OTRoomRepository otRoomRepository, OTScheduleRepository otScheduleRepository,
			AdmissionRepository admissionRepository, DoctorRepository doctorRepository) {
		this.otRoomRepository = otRoomRepository;
		this.otScheduleRepository = otScheduleRepository;
		this.admissionRepository = admissionRepository;
		this.doctorRepository = doctorRepository;
	}

	public OTRoomDTO createOTRoom(OTRoomDTO dto) {
		if (otRoomRepository.existsByRoomNumber(dto.getRoomNumber())) {
			throw new IllegalStateException("OT Room '" + dto.getRoomNumber() + "' already exists.");
		}
		OTRoom room = new OTRoom();
		room.setRoomNumber(dto.getRoomNumber());
		room.setRoomType(dto.getRoomType());

		OTRoom saved = otRoomRepository.save(room);
		dto.setId(saved.getId());
		return dto;
	}

	public List<OTRoomDTO> getAllOTRooms() {
		return otRoomRepository.findAll().stream().map(r -> {
			OTRoomDTO dto = new OTRoomDTO();
			dto.setId(r.getId());
			dto.setRoomNumber(r.getRoomNumber());
			dto.setRoomType(r.getRoomType());
			return dto;
		}).collect(Collectors.toList());
	}

	@Transactional
	public OTScheduleResponseDTO scheduleSurgery(OTScheduleRequestDTO dto) {
		if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().isEqual(dto.getEndTime())) {
			throw new IllegalStateException("End time must be strictly after start time.");
		}

		Admission admission = admissionRepository.findById(dto.getAdmissionId()).orElseThrow(
				() -> new ResourceNotFoundException("Admission not found with ID: " + dto.getAdmissionId()));

		if (admission.getStatus() != AdmissionStatus.ADMITTED) {
			throw new IllegalStateException("Cannot schedule surgery for a discharged or inactive admission.");
		}

		if (!doctorRepository.existsById(dto.getLeadSurgeonId())) {
			throw new ResourceNotFoundException("Doctor/Surgeon not found with ID: " + dto.getLeadSurgeonId());
		}

		OTRoom room = otRoomRepository.findById(dto.getOtRoomId())
				.orElseThrow(() -> new ResourceNotFoundException("OT Room not found with ID: " + dto.getOtRoomId()));

		List<OTSchedule> overlaps = otScheduleRepository.findOverlappingSchedules(dto.getOtRoomId(), dto.getStartTime(),
				dto.getEndTime());

		if (!overlaps.isEmpty()) {
			throw new IllegalStateException(
					"OT Room '" + room.getRoomNumber() + "' is already booked for this time slot.");
		}

		OTSchedule schedule = new OTSchedule();
		schedule.setOtRoom(room);
		schedule.setAdmissionId(dto.getAdmissionId());
		schedule.setLeadSurgeonId(dto.getLeadSurgeonId());
		schedule.setProcedureName(dto.getProcedureName());
		schedule.setStartTime(dto.getStartTime());
		schedule.setEndTime(dto.getEndTime());
		schedule.setProcedureCharge(dto.getProcedureCharge());
		schedule.setStatus(SurgeryStatus.SCHEDULED);

		OTSchedule saved = otScheduleRepository.save(schedule);
		return mapToDTO(saved);
	}

	@Transactional
	public OTScheduleResponseDTO updateSurgeryStatus(Long scheduleId, SurgeryStatus status) {
		OTSchedule schedule = otScheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new ResourceNotFoundException("OT Schedule not found with ID: " + scheduleId));

		if (schedule.getStatus() == SurgeryStatus.COMPLETED) {
			throw new IllegalStateException("Surgery is already marked as completed.");
		}

		schedule.setStatus(status);
		OTSchedule updated = otScheduleRepository.save(schedule);
		return mapToDTO(updated);
	}

	@Transactional
	public OTScheduleResponseDTO completeSurgery(Long scheduleId, CompleteSurgeryDTO dto) {
		OTSchedule schedule = otScheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new ResourceNotFoundException("OT Schedule not found with ID: " + scheduleId));

		schedule.setStatus(SurgeryStatus.COMPLETED);
		schedule.setSurgicalNotes(dto.getSurgicalNotes());

		OTSchedule updated = otScheduleRepository.save(schedule);
		return mapToDTO(updated);
	}

	public List<OTScheduleResponseDTO> getSchedulesByAdmission(Long admissionId) {
		return otScheduleRepository.findByAdmissionId(admissionId).stream().map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	private OTScheduleResponseDTO mapToDTO(OTSchedule s) {
		OTScheduleResponseDTO dto = new OTScheduleResponseDTO();
		dto.setId(s.getId());
		dto.setOtRoomId(s.getOtRoom().getId());
		dto.setRoomNumber(s.getOtRoom().getRoomNumber());
		dto.setRoomType(s.getOtRoom().getRoomType());
		dto.setAdmissionId(s.getAdmissionId());
		dto.setLeadSurgeonId(s.getLeadSurgeonId());
		dto.setProcedureName(s.getProcedureName());
		dto.setStartTime(s.getStartTime());
		dto.setEndTime(s.getEndTime());
		dto.setProcedureCharge(s.getProcedureCharge());
		dto.setStatus(s.getStatus());
		dto.setSurgicalNotes(s.getSurgicalNotes());
		return dto;
	}
}