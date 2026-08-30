package com.hospital.management.dto;

import com.hospital.management.enums.WardCategory;

public class WardResponseDTO {
	private Long id;
	private String name;
	private WardCategory category;
	private Double dailyRate;

	public WardResponseDTO() {
	}

	public WardResponseDTO(Long id, String name, WardCategory category, Double dailyRate) {
		this.id = id;
		this.name = name;
		this.category = category;
		this.dailyRate = dailyRate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public WardCategory getCategory() {
		return category;
	}

	public void setCategory(WardCategory category) {
		this.category = category;
	}

	public Double getDailyRate() {
		return dailyRate;
	}

	public void setDailyRate(Double dailyRate) {
		this.dailyRate = dailyRate;
	}
}