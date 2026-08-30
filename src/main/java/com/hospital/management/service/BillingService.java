package com.hospital.management.service;

import com.hospital.management.dto.InvoiceResponseDTO;
import com.hospital.management.dto.PaymentVerificationDTO;
import com.hospital.management.dto.RazorpayOrderResponseDTO;
import com.hospital.management.entity.*;
import com.hospital.management.enums.PaymentMode;
import com.hospital.management.enums.PaymentStatus;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillingService {

	@Value("${razorpay.key.id}")
	private String razorpayKeyId;

	@Value("${razorpay.key.secret}")
	private String razorpayKeySecret;

	private final InvoiceRepository invoiceRepository;
	private final AdmissionRepository admissionRepository;
	private final LabOrderRepository labOrderRepository;
	private final MedicationOrderRepository medicationOrderRepository;
	private final OTScheduleRepository otScheduleRepository;

	public BillingService(InvoiceRepository invoiceRepository, AdmissionRepository admissionRepository,
			LabOrderRepository labOrderRepository, MedicationOrderRepository medicationOrderRepository,
			OTScheduleRepository otScheduleRepository) {
		this.invoiceRepository = invoiceRepository;
		this.admissionRepository = admissionRepository;
		this.labOrderRepository = labOrderRepository;
		this.medicationOrderRepository = medicationOrderRepository;
		this.otScheduleRepository = otScheduleRepository;
	}

	@Transactional
	public InvoiceResponseDTO generateInvoiceForAdmission(Long admissionId) {
		Admission admission = admissionRepository.findById(admissionId)
				.orElseThrow(() -> new ResourceNotFoundException("Admission not found with ID: " + admissionId));

		LocalDateTime endTime = admission.getDischargeTime() != null ? admission.getDischargeTime()
				: LocalDateTime.now();
		long hours = Math.max(1, Duration.between(admission.getAdmissionTime(), endTime).toHours());
		long days = (long) Math.ceil((double) hours / 24.0);
		double roomRate = admission.getBed().getWard().getDailyRate();
		double roomCharges = days * roomRate;

		List<LabOrder> labOrders = labOrderRepository.findByAdmissionId(admissionId);
		double labCharges = labOrders.stream().mapToDouble(order -> order.getTest().getPrice()).sum();

		List<MedicationOrder> medOrders = medicationOrderRepository.findByAdmissionId(admissionId);
		double medCharges = medOrders.stream().mapToDouble(MedicationOrder::getUnitPrice).sum();

		List<OTSchedule> otSchedules = otScheduleRepository.findByAdmissionId(admissionId);
		double otCharges = otSchedules.stream().mapToDouble(OTSchedule::getProcedureCharge).sum();

		double totalAmount = roomCharges + labCharges + medCharges + otCharges;

		Invoice invoice = invoiceRepository.findByAdmissionId(admissionId).orElse(new Invoice());

		invoice.setAdmissionId(admissionId);
		invoice.setRoomCharges(roomCharges);
		invoice.setLabCharges(labCharges);
		invoice.setMedicineCharges(medCharges);
		invoice.setOtCharges(otCharges);
		invoice.setTotalAmount(totalAmount);

		Invoice saved = invoiceRepository.save(invoice);
		return mapToDTO(saved);
	}

	@Transactional
	public RazorpayOrderResponseDTO createRazorpayOrder(Long invoiceId) {
		Invoice invoice = invoiceRepository.findById(invoiceId)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

		if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
			throw new IllegalStateException("Invoice is already fully paid.");
		}

		try {
			RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

			JSONObject orderRequest = new JSONObject();
			// Razorpay processes amount in currency sub-units (Paise for INR, multiply by
			// 100)
			long amountInPaise = Math.round(invoice.getTotalAmount() * 100);
			orderRequest.put("amount", amountInPaise);
			orderRequest.put("currency", "INR");
			orderRequest.put("receipt", "inv_rcpt_" + invoice.getId());

			Order order = razorpayClient.orders.create(orderRequest);
			String razorpayOrderId = order.get("id");

			invoice.setRazorpayOrderId(razorpayOrderId);
			invoiceRepository.save(invoice);

			return new RazorpayOrderResponseDTO(razorpayOrderId, invoice.getTotalAmount(), "INR", razorpayKeyId);
		} catch (Exception ex) {
			throw new RuntimeException("Error communicating with Razorpay: " + ex.getMessage());
		}
	}

	@Transactional
	public InvoiceResponseDTO verifyAndCompletePayment(Long invoiceId, PaymentVerificationDTO dto) {
		Invoice invoice = invoiceRepository.findById(invoiceId)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

		try {
			JSONObject options = new JSONObject();
			options.put("razorpay_order_id", dto.getRazorpayOrderId());
			options.put("razorpay_payment_id", dto.getRazorpayPaymentId());
			options.put("razorpay_signature", dto.getRazorpaySignature());

			boolean isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);

			if (!isValidSignature) {
				throw new IllegalStateException("Payment verification failed: Invalid Razorpay signature.");
			}

			invoice.setRazorpayPaymentId(dto.getRazorpayPaymentId());
			invoice.setPaymentMode(PaymentMode.RAZORPAY_ONLINE);
			invoice.setPaymentStatus(PaymentStatus.PAID);
			invoice.setPaidAmount(invoice.getTotalAmount());
			invoice.setSettledAt(LocalDateTime.now());

			Invoice saved = invoiceRepository.save(invoice);
			return mapToDTO(saved);
		} catch (Exception ex) {
			throw new IllegalStateException("Payment verification error: " + ex.getMessage());
		}
	}

	public InvoiceResponseDTO getInvoiceByAdmission(Long admissionId) {
		Invoice invoice = invoiceRepository.findByAdmissionId(admissionId)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found for Admission ID: " + admissionId));
		return mapToDTO(invoice);
	}
	
	@Transactional
	public InvoiceResponseDTO settleOfflinePayment(Long invoiceId, PaymentMode mode) {
	    Invoice invoice = invoiceRepository.findById(invoiceId)
	            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

	    if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
	        throw new IllegalStateException("Invoice is already fully paid.");
	    }

	    invoice.setPaymentMode(mode);
	    invoice.setPaymentStatus(PaymentStatus.PAID);
	    invoice.setPaidAmount(invoice.getTotalAmount());
	    invoice.setSettledAt(LocalDateTime.now());

	    Invoice saved = invoiceRepository.save(invoice);
	    return mapToDTO(saved);
	}

	private InvoiceResponseDTO mapToDTO(Invoice inv) {
		InvoiceResponseDTO dto = new InvoiceResponseDTO();
		dto.setId(inv.getId());
		dto.setAdmissionId(inv.getAdmissionId());
		dto.setRoomCharges(inv.getRoomCharges());
		dto.setLabCharges(inv.getLabCharges());
		dto.setMedicineCharges(inv.getMedicineCharges());
		dto.setOtCharges(inv.getOtCharges());
		dto.setTotalAmount(inv.getTotalAmount());
		dto.setPaidAmount(inv.getPaidAmount());
		dto.setPaymentStatus(inv.getPaymentStatus());
		dto.setPaymentMode(inv.getPaymentMode());
		dto.setRazorpayOrderId(inv.getRazorpayOrderId());
		dto.setRazorpayPaymentId(inv.getRazorpayPaymentId());
		dto.setGeneratedAt(inv.getGeneratedAt());
		dto.setSettledAt(inv.getSettledAt());
		return dto;
	}
}