package com.hospital.management.dto;

import com.hospital.management.enums.AdmissionStatus;
import java.time.LocalDateTime;

public class AdmissionResponseDTO {
	private Long id;
	private Long patientId;
	private Long doctorId;
	private Long bedId;
	private String bedNumber;
	private String wardName;
	private LocalDateTime admissionTime;
	private LocalDateTime dischargeTime;
	private AdmissionStatus status;
	private String diagnosis;
	private String dischargeNotes;

	public AdmissionResponseDTO() {
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

	public Long getBedId() {
		return bedId;
	}

	public void setBedId(Long bedId) {
		this.bedId = bedId;
	}

	public String getBedNumber() {
		return bedNumber;
	}

	public void setBedNumber(String bedNumber) {
		this.bedNumber = bedNumber;
	}

	public String getWardName() {
		return wardName;
	}

	public void setWardName(String wardName) {
		this.wardName = wardName;
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