package com.hospital.management.dto;

import com.hospital.management.enums.BedStatus;
import com.hospital.management.enums.WardCategory;

public class BedResponseDTO {
	private Long id;
	private String bedNumber;
	private BedStatus status;
	private Long wardId;
	private String wardName;
	private WardCategory wardCategory;
	private Double dailyRate;

	public BedResponseDTO() {
	}

	public BedResponseDTO(Long id, String bedNumber, BedStatus status, Long wardId, String wardName,
			WardCategory wardCategory, Double dailyRate) {
		this.id = id;
		this.bedNumber = bedNumber;
		this.status = status;
		this.wardId = wardId;
		this.wardName = wardName;
		this.wardCategory = wardCategory;
		this.dailyRate = dailyRate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getBedNumber() {
		return bedNumber;
	}

	public void setBedNumber(String bedNumber) {
		this.bedNumber = bedNumber;
	}

	public BedStatus getStatus() {
		return status;
	}

	public void setStatus(BedStatus status) {
		this.status = status;
	}

	public Long getWardId() {
		return wardId;
	}

	public void setWardId(Long wardId) {
		this.wardId = wardId;
	}

	public String getWardName() {
		return wardName;
	}

	public void setWardName(String wardName) {
		this.wardName = wardName;
	}

	public WardCategory getWardCategory() {
		return wardCategory;
	}

	public void setWardCategory(WardCategory wardCategory) {
		this.wardCategory = wardCategory;
	}

	public Double getDailyRate() {
		return dailyRate;
	}

	public void setDailyRate(Double dailyRate) {
		this.dailyRate = dailyRate;
	}
}