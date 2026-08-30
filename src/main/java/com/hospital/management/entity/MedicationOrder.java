package com.hospital.management.entity;

import com.hospital.management.enums.MedicationRoute;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_orders")
public class MedicationOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long admissionId;

	@Column(nullable = false)
	private Long doctorId;

	@Column(nullable = false)
	private String medicineName;

	@Column(nullable = false)
	private String dosage;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private MedicationRoute route;

	@Column(nullable = false)
	private String frequency;

	@Column(nullable = false)
	private Double unitPrice;

	@Column(nullable = false)
	private boolean isDispensed = false;

	private Long administeredByNurseId;

	private LocalDateTime administeredAt;

	private String administrationNotes;

	@Column(nullable = false)
	private LocalDateTime prescribedAt = LocalDateTime.now();

	public MedicationOrder() {
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