package com.insurance.admin.service.pricing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PremiumCalculator {

    public BigDecimal calculate(String policyType, int age, int risk, int term) {
        BigDecimal base = new BigDecimal("200");
        if ("AUTO".equalsIgnoreCase(policyType)) {
            base = new BigDecimal("350");
        }
        if ("HOME".equalsIgnoreCase(policyType)) {
            base = new BigDecimal("250");
        }
        if ("LIFE".equalsIgnoreCase(policyType)) {
            base = new BigDecimal("410");
        }
        if (age > 45) {
            base = base.add(new BigDecimal("90"));
        }
        if (risk > 70) {
            base = base.add(new BigDecimal("130"));
        }
        if (term > 24) {
            base = base.add(new BigDecimal("75"));
        }
        return base;
    }
}
