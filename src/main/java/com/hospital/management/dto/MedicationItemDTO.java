package com.hospital.management.dto;

import com.hospital.management.enums.MedicationRoute;

public class MedicationItemDTO {
	private String medicineName;
	private String dosage;
	private MedicationRoute route;
	private String frequency;
	private Double unitPrice;

	public MedicationItemDTO() {
	}

	public String getMedicineName() {
		return medicineName;
	}

	public void setMedicineName(String medicineName) {
		this.medicineName = medicineName;
	}

	public String getDosage() {
		return dosage;
	}

	public void setDosage(String dosage) {
		this.dosage = dosage;
	}

	public MedicationRoute getRoute() {
		return route;
	}

	public void setRoute(MedicationRoute route) {
		this.route = route;
	}

	public String getFrequency() {
		return frequency;
	}

	public void setFrequency(String frequency) {
		this.frequency = frequency;
	}

	public Double getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(Double unitPrice) {
		this.unitPrice = unitPrice;
	}
}