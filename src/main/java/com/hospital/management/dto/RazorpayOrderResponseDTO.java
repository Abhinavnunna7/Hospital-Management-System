package com.hospital.management.dto;

public class RazorpayOrderResponseDTO {
	private String razorpayOrderId;
	private Double amount;
	private String currency;
	private String razorpayKeyId;

	public RazorpayOrderResponseDTO(String razorpayOrderId, Double amount, String currency, String razorpayKeyId) {
		this.razorpayOrderId = razorpayOrderId;
		this.amount = amount;
		this.currency = currency;
		this.razorpayKeyId = razorpayKeyId;
	}

	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}

	public Double getAmount() {
		return amount;
	}

	public String getCurrency() {
		return currency;
	}

	public String getRazorpayKeyId() {
		return razorpayKeyId;
	}
}