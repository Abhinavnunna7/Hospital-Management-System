package com.hospital.management.dto;

import com.hospital.management.enums.MedicationRoute;
import java.time.LocalDateTime;

public class MedicationResponseDTO {
	private Long id;
	private Long admissionId;
	private Long doctorId;
	private String medicineName;
	private String dosage;
	private MedicationRoute route;
	private String frequency;
	private Double unitPrice;
	private boolean isDispensed;
	private Long administeredByNurseId;
	private LocalDateTime administeredAt;
	private String administrationNotes;
	private LocalDateTime prescribedAt;

	public MedicationResponseDTO() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getAdmissionId() {
		return admissionId;
	}

	public void setAdmissionId(Long admissionId) {
		this.admissionId = admissionId;
	}

	public Long getDoctorId() {
		return doctorId;
	}

	public void setDoctorId(Long doctorId) {
		this.doctorId = doctorId;
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

	public boolean isDispensed() {
		return isDispensed;
	}

	public void setDispensed(boolean dispensed) {
		isDispensed = dispensed;
	}

	public Long getAdministeredByNurseId() {
		return administeredByNurseId;
	}

	public void setAdministeredByNurseId(Long administeredByNurseId) {
		this.administeredByNurseId = administeredByNurseId;
	}

	public LocalDateTime getAdministeredAt() {
		return administeredAt;
	}

	public void setAdministeredAt(LocalDateTime administeredAt) {
		this.administeredAt = administeredAt;
	}

	public String getAdministrationNotes() {
		return administrationNotes;
	}

	public void setAdministrationNotes(String administrationNotes) {
		this.administrationNotes = administrationNotes;
	}

	public LocalDateTime getPrescribedAt() {
		return prescribedAt;
	}

	public void setPrescribedAt(LocalDateTime prescribedAt) {
		this.prescribedAt = prescribedAt;
	}
}