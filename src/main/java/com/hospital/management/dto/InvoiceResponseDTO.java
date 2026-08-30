package com.hospital.management.dto;

import com.hospital.management.enums.PaymentMode;
import com.hospital.management.enums.PaymentStatus;
import java.time.LocalDateTime;

public class InvoiceResponseDTO {
	private Long id;
	private Long admissionId;
	private Double roomCharges;
	private Double labCharges;
	private Double medicineCharges;
	private Double otCharges;
	private Double totalAmount;
	private Double paidAmount;
	private PaymentStatus paymentStatus;
	private PaymentMode paymentMode;
	private String razorpayOrderId;
	private String razorpayPaymentId;
	private LocalDateTime generatedAt;
	private LocalDateTime settledAt;

	public InvoiceResponseDTO() {
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