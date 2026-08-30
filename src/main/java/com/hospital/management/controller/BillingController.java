package com.hospital.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.management.dto.InvoiceResponseDTO;
import com.hospital.management.dto.PaymentVerificationDTO;
import com.hospital.management.dto.RazorpayOrderResponseDTO;
import com.hospital.management.enums.PaymentMode;
import com.hospital.management.service.BillingService;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

	private final BillingService billingService;

	public BillingController(BillingService billingService) {
		this.billingService = billingService;
	}

	@PostMapping("/invoices/admission/{admissionId}/generate")
	public ResponseEntity<InvoiceResponseDTO> generateInvoice(@PathVariable Long admissionId) {
		return new ResponseEntity<>(billingService.generateInvoiceForAdmission(admissionId), HttpStatus.CREATED);
	}

	@PostMapping("/invoices/{invoiceId}/create-razorpay-order")
	public ResponseEntity<RazorpayOrderResponseDTO> createRazorpayOrder(@PathVariable Long invoiceId) {
		return ResponseEntity.ok(billingService.createRazorpayOrder(invoiceId));
	}

	@PostMapping("/invoices/{invoiceId}/verify-payment")
	public ResponseEntity<InvoiceResponseDTO> verifyPayment(@PathVariable Long invoiceId,
			@RequestBody PaymentVerificationDTO dto) {
		return ResponseEntity.ok(billingService.verifyAndCompletePayment(invoiceId, dto));
	}

	@GetMapping("/invoices/admission/{admissionId}")
	public ResponseEntity<InvoiceResponseDTO> getInvoiceByAdmission(@PathVariable Long admissionId) {
		return ResponseEntity.ok(billingService.getInvoiceByAdmission(admissionId));
	}
	
	@PatchMapping("/invoices/{invoiceId}/settle-offline")
	public ResponseEntity<InvoiceResponseDTO> settleOffline(
	        @PathVariable Long invoiceId,
	        @RequestParam PaymentMode mode) {
	    return ResponseEntity.ok(billingService.settleOfflinePayment(invoiceId, mode));
	}
}