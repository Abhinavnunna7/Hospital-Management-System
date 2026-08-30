package com.hospital.management.entity;

import com.hospital.management.enums.SurgeryStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ot_schedules")
public class OTSchedule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ot_room_id", nullable = false)
	private OTRoom otRoom;

	@Column(nullable = false)
	private Long admissionId;

	@Column(nullable = false)
	private Long leadSurgeonId;

	@Column(nullable = false)
	private String procedureName;

	@Column(nullable = false)
	private LocalDateTime startTime;

	@Column(nullable = false)
	private LocalDateTime endTime;

	@Column(nullable = false)
	private Double procedureCharge;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SurgeryStatus status = SurgeryStatus.SCHEDULED;

	private String surgicalNotes;

	public OTSchedule() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public OTRoom getOtRoom() {
		return otRoom;
	}

	public void setOtRoom(OTRoom otRoom) {
		this.otRoom = otRoom;
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