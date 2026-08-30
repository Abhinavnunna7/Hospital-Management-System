package com.hospital.management.dto;

public class BedRequestDTO {
	private String bedNumber;
	private Long wardId;

	public BedRequestDTO() {
	}

	public String getBedNumber() {
		return bedNumber;
	}

	public void setBedNumber(String bedNumber) {
		this.bedNumber = bedNumber;
	}

	public Long getWardId() {
		return wardId;
	}

	public void setWardId(Long wardId) {
		this.wardId = wardId;
	}
}