package com.hospital.management.entity;

import com.hospital.management.enums.AdmissionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions")
public class Admission {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long patientId;

	@Column(nullable = false)
	private Long doctorId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "bed_id", nullable = false)
	private Bed bed;

	@Column(nullable = false)
	private LocalDateTime admissionTime;

	private LocalDateTime dischargeTime;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AdmissionStatus status;

	private String diagnosis;

	private String dischargeNotes;

	public Admission() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getPatientId() {
		return patientId;
	}

	public void setPatientId(Long patientId) {
		this.patientId = patientId;
	}

	public Long getDoctorId() {
		return doctorId;
	}

	public void setDoctorId(Long doctorId) {
		this.doctorId = doctorId;
	}

	public Bed getBed() {
		return bed;
	}

	public void setBed(Bed bed) {
		this.bed = bed;
	}

	public LocalDateTime getAdmissionTime() {
		return admissionTime;
	}

	public void setAdmissionTime(LocalDateTime admissionTime) {
		this.admissionTime = admissionTime;
	}

	public LocalDateTime getDischargeTime() {
		return dischargeTime;
	}

	public void setDischargeTime(LocalDateTime dischargeTime) {
		this.dischargeTime = dischargeTime;
	}

	public AdmissionStatus getStatus() {
		return status;
	}

	public void setStatus(AdmissionStatus status) {
		this.status = status;
	}

	public String getDiagnosis() {
		return diagnosis;
	}

	public void setDiagnosis(String diagnosis) {
		this.diagnosis = diagnosis;
	}

	public String getDischargeNotes() {
		return dischargeNotes;
	}

	public void setDischargeNotes(String dischargeNotes) {
		this.dischargeNotes = dischargeNotes;
	}
}