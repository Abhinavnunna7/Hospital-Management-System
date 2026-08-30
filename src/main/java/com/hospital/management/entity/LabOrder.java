package com.hospital.management.entity;

import com.hospital.management.enums.LabOrderStatus;
import com.hospital.management.enums.OrderPriority;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_orders")
public class LabOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long admissionId;

	@Column(nullable = false)
	private Long doctorId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "test_id", nullable = false)
	private LabTest test;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private OrderPriority priority;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private LabOrderStatus status = LabOrderStatus.PENDING;

	private String resultFindings;

	@Column(nullable = false)
	private LocalDateTime orderedAt = LocalDateTime.now();

	private LocalDateTime completedAt;

	public LabOrder() {
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

	public LabTest getTest() {
		return test;
	}

	public void setTest(LabTest test) {
		this.test = test;
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