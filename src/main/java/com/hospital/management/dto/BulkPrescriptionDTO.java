package com.hospital.management.dto;

import java.util.List;

public class BulkPrescriptionDTO {
    private Long admissionId;
    private Long doctorId;
    private List<MedicationItemDTO> medicines;

    public BulkPrescriptionDTO() {}

    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public List<MedicationItemDTO> getMedicines() { return medicines; }
    public void setMedicines(List<MedicationItemDTO> medicines) { this.medicines = medicines; }
}