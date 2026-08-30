package com.hospital.management.dto;

import com.hospital.management.enums.SurgeryStatus;
import java.time.LocalDateTime;

public class OTScheduleResponseDTO {
	private Long id;
	private Long otRoomId;
	private String roomNumber;
	private String roomType;
	private Long admissionId;
	private Long leadSurgeonId;
	private String procedureName;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private Double procedureCharge;
	private SurgeryStatus status;
	private String surgicalNotes;

	public OTScheduleResponseDTO() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getOtRoomId() {
		return otRoomId;
	}

	public void setOtRoomId(Long otRoomId) {
		this.otRoomId = otRoomId;
	}

	public String getRoomNumber() {
		return roomNumber;
	}

	public void setRoomNumber(String roomNumber) {
		this.roomNumber = roomNumber;
	}

	public String getRoomType() {
		return roomType;
	}

	public void setRoomType(String roomType) {
		this.roomType = roomType;
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

	public SurgeryStatus getStatus() {
		return status;
	}

	public void setStatus(SurgeryStatus status) {
		this.status = status;
	}

	public String getSurgicalNotes() {
		return surgicalNotes;
	}

	public void setSurgicalNotes(String surgicalNotes) {
		this.surgicalNotes = surgicalNotes;
	}
}