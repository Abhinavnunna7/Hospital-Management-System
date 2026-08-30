package com.hospital.management.dto;

import com.hospital.management.enums.WardCategory;

public class WardRequestDTO {
	private String name;
	private WardCategory category;
	private Double dailyRate;

	public WardRequestDTO() {
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