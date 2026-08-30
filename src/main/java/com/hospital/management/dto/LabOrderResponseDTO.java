package com.hospital.management.dto;

import com.hospital.management.enums.LabOrderStatus;
import com.hospital.management.enums.OrderPriority;
import java.time.LocalDateTime;

public class LabOrderResponseDTO {
	private Long id;
	private Long admissionId;
	private Long doctorId;
	private Long testId;
	private String testName;
	private Double price;
	private OrderPriority priority;
	private LabOrderStatus status;
	private String resultFindings;
	private LocalDateTime orderedAt;
	private LocalDateTime completedAt;

	public LabOrderResponseDTO() {
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

	public Long getTestId() {
		return testId;
	}

	public void setTestId(Long testId) {
		this.testId = testId;
	}

	public String getTestName() {
		return testName;
	}

	public void setTestName(String testName) {
		this.testName = testName;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public OrderPriority getPriority() {
		return priority;
	}

	public void setPriority(OrderPriority priority) {
		this.priority = priority;
	}

	public LabOrderStatus getStatus() {
		return status;
	}

	public void setStatus(LabOrderStatus status) {
		this.status = status;
	}

	public String getResultFindings() {
		return resultFindings;
	}

	public void setResultFindings(String resultFindings) {
		this.resultFindings = resultFindings;
	}

	public LocalDateTime getOrderedAt() {
		return orderedAt;
	}

	public void setOrderedAt(LocalDateTime orderedAt) {
		this.orderedAt = orderedAt;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(LocalDateTime completedAt) {
		this.completedAt = completedAt;
	}
}