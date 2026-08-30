package com.hospital.management.service;

import com.hospital.management.dto.BedRequestDTO;
import com.hospital.management.dto.BedResponseDTO;
import com.hospital.management.dto.WardRequestDTO;
import com.hospital.management.dto.WardResponseDTO;
import com.hospital.management.entity.Bed;
import com.hospital.management.entity.Ward;
import com.hospital.management.enums.BedStatus;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.BedRepository;
import com.hospital.management.repository.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WardBedService {

	private final WardRepository wardRepository;
	private final BedRepository bedRepository;

	public WardBedService(WardRepository wardRepository, BedRepository bedRepository) {
		this.wardRepository = wardRepository;
		this.bedRepository = bedRepository;
	}

	public WardResponseDTO createWard(WardRequestDTO dto) {
		if (wardRepository.existsByName(dto.getName())) {
			throw new IllegalStateException("Ward with name '" + dto.getName() + "' already exists.");
		}
		Ward ward = new Ward();
		ward.setName(dto.getName());
		ward.setCategory(dto.getCategory());
		ward.setDailyRate(dto.getDailyRate());
		Ward saved = wardRepository.save(ward);
		return new WardResponseDTO(saved.getId(), saved.getName(), saved.getCategory(), saved.getDailyRate());
	}

	public List<WardResponseDTO> getAllWards() {
		return wardRepository.findAll().stream()
				.map(w -> new WardResponseDTO(w.getId(), w.getName(), w.getCategory(), w.getDailyRate()))
				.collect(Collectors.toList());
	}

	@Transactional
	public BedResponseDTO addBed(BedRequestDTO dto) {
		if (bedRepository.existsByBedNumber(dto.getBedNumber())) {
			throw new IllegalStateException("Bed number '" + dto.getBedNumber() + "' already exists.");
		}

		Ward ward = wardRepository.findById(dto.getWardId())
				.orElseThrow(() -> new ResourceNotFoundException("Ward not found with ID: " + dto.getWardId()));

		Bed bed = new Bed();
		bed.setBedNumber(dto.getBedNumber());
		bed.setStatus(BedStatus.AVAILABLE);
		bed.setWard(ward);

		Bed savedBed = bedRepository.save(bed);
		return mapToBedResponseDTO(savedBed);
	}

	public List<BedResponseDTO> getAllAvailableBeds() {
		return bedRepository.findByStatus(BedStatus.AVAILABLE).stream().map(this::mapToBedResponseDTO)
				.collect(Collectors.toList());
	}

	public List<BedResponseDTO> getAvailableBedsByWard(Long wardId) {
		return bedRepository.findByWardIdAndStatus(wardId, BedStatus.AVAILABLE).stream().map(this::mapToBedResponseDTO)
				.collect(Collectors.toList());
	}

	@Transactional
	public BedResponseDTO updateBedStatus(Long bedId, BedStatus newStatus) {
		Bed bed = bedRepository.findByIdWithLock(bedId)
				.orElseThrow(() -> new ResourceNotFoundException("Bed not found with ID: " + bedId));

		bed.setStatus(newStatus);
		Bed updatedBed = bedRepository.save(bed);
		return mapToBedResponseDTO(updatedBed);
	}

	private BedResponseDTO mapToBedResponseDTO(Bed bed) {
		return new BedResponseDTO(bed.getId(), bed.getBedNumber(), bed.getStatus(), bed.getWard().getId(),
				bed.getWard().getName(), bed.getWard().getCategory(), bed.getWard().getDailyRate());
	}
}