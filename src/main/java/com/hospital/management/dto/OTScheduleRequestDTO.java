package com.hospital.management.dto;

import java.time.LocalDateTime;

public class OTScheduleRequestDTO {
	private Long otRoomId;
	private Long admissionId;
	private Long leadSurgeonId;
	private String procedureName;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private Double procedureCharge;

	public OTScheduleRequestDTO() {
	}

	public Long getOtRoomId() {
		return otRoomId;
	}

	public void setOtRoomId(Long otRoomId) {
		this.otRoomId = otRoomId;
	}

	public Long getAdmissionId() {
		return admissionId;
	}

	public void setAdmissionId(Long admissionId) {
		this.admissionId = admissionId;
	}

	public Long getLeadSurgeonId() {
		return leadSurgeonId;
	}

	public void setLeadSurgeonId(Long leadSurgeonId) {
		this.leadSurgeonId = leadSurgeonId;
	}

	public String getProcedureName() {
		return procedureName;
	}

	public void setProcedureName(String procedureName) {
		this.procedureName = procedureName;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public Double getProcedureCharge() {
		return procedureCharge;
	}

	public void setProcedureCharge(Double procedureCharge) {
		this.procedureCharge = procedureCharge;
	}
}