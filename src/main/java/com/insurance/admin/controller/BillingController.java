package com.insurance.admin.controller;

import com.insurance.admin.entity.BillingRecord;
import com.insurance.admin.service.BillingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/payment")
    public BillingRecord processPayment(@RequestBody BillingRecord billingRecord) {
        return billingService.processPayment(billingRecord);
    }

    @GetMapping("/policy/{policyId}")
    public List<BillingRecord> byPolicy(@PathVariable Long policyId) {
        return billingService.findByPolicyId(policyId);
    }
}
