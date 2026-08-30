package com.hospital.management.repository;

import com.hospital.management.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
	Optional<Invoice> findByAdmissionId(Long admissionId);

	Optional<Invoice> findByRazorpayOrderId(String razorpayOrderId);
}