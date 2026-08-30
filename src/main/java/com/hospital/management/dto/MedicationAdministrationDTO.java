package com.hospital.management.dto;

public class MedicationAdministrationDTO {
	private Long nurseId;
	private String administrationNotes;

	public MedicationAdministrationDTO() {
	}

	public Long getNurseId() {
		return nurseId;
	}

	public void setNurseId(Long nurseId) {
		this.nurseId = nurseId;
	}

	public String getAdministrationNotes() {
		return administrationNotes;
	}

	public void setAdministrationNotes(String administrationNotes) {
		this.administrationNotes = administrationNotes;
	}
}