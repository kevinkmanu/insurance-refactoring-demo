package com.insurance.admin.service;

import com.insurance.admin.entity.BillingRecord;
import com.insurance.admin.repository.BillingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BillingService {

    private final BillingRepository billingRepository;

    public BillingService(BillingRepository billingRepository) {
        this.billingRepository = billingRepository;
    }

    public BillingRecord processPayment(BillingRecord billingRecord) {
        if (billingRecord.getPaymentStatus() == null) {
            billingRecord.setPaymentStatus("PENDING");
        }
        if ("PAID".equalsIgnoreCase(billingRecord.getPaymentStatus())) {
            billingRecord.setPaidDate(LocalDate.now());
        }
        return billingRepository.save(billingRecord);
    }

    public List<BillingRecord> findByPolicyId(Long policyId) {
        return billingRepository.findByPolicyId(policyId);
    }
}
