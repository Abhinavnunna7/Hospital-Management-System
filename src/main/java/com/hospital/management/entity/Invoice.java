package com.hospital.management.entity;

import com.hospital.management.enums.PaymentMode;
import com.hospital.management.enums.PaymentStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private Long admissionId;

	@Column(nullable = false)
	private Double roomCharges = 0.0;

	@Column(nullable = false)
	private Double labCharges = 0.0;

	@Column(nullable = false)
	private Double medicineCharges = 0.0;

	@Column(nullable = false)
	private Double otCharges = 0.0;

	@Column(nullable = false)
	private Double totalAmount = 0.0;

	@Column(nullable = false)
	private Double paidAmount = 0.0;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

	@Enumerated(EnumType.STRING)
	private PaymentMode paymentMode;

	private String razorpayOrderId;

	private String razorpayPaymentId;

	@Column(nullable = false)
	private LocalDateTime generatedAt = LocalDateTime.now();

	private LocalDateTime settledAt;

	public Invoice() {
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

	public Double getRoomCharges() {
		return roomCharges;
	}

	public void setRoomCharges(Double roomCharges) {
		this.roomCharges = roomCharges;
	}

	public Double getLabCharges() {
		return labCharges;
	}

	public void setLabCharges(Double labCharges) {
		this.labCharges = labCharges;
	}

	public Double getMedicineCharges() {
		return medicineCharges;
	}

	public void setMedicineCharges(Double medicineCharges) {
		this.medicineCharges = medicineCharges;
	}

	public Double getOtCharges() {
		return otCharges;
	}

	public void setOtCharges(Double otCharges) {
		this.otCharges = otCharges;
	}

	public Double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public Double getPaidAmount() {
		return paidAmount;
	}

	public void setPaidAmount(Double paidAmount) {
		this.paidAmount = paidAmount;
	}

	public PaymentStatus getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(PaymentStatus paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public PaymentMode getPaymentMode() {
		return paymentMode;
	}

	public void setPaymentMode(PaymentMode paymentMode) {
		this.paymentMode = paymentMode;
	}

	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}

	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}

	public String getRazorpayPaymentId() {
		return razorpayPaymentId;
	}

	public void setRazorpayPaymentId(String razorpayPaymentId) {
		this.razorpayPaymentId = razorpayPaymentId;
	}

	public LocalDateTime getGeneratedAt() {
		return generatedAt;
	}

	public void setGeneratedAt(LocalDateTime generatedAt) {
		this.generatedAt = generatedAt;
	}

	public LocalDateTime getSettledAt() {
		return settledAt;
	}

	public void setSettledAt(LocalDateTime settledAt) {
		this.settledAt = settledAt;
	}
}