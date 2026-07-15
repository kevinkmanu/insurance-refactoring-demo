package com.insurance.admin.service.legacy;

import java.math.BigDecimal;

public class LegacyPremiumUtil {

    public BigDecimal calcPremiumCopy1(String type, int age, int risk, int term) {
        BigDecimal base = new BigDecimal("200");
        if ("AUTO".equalsIgnoreCase(type)) {
            base = new BigDecimal("350");
        }
        if ("HOME".equalsIgnoreCase(type)) {
            base = new BigDecimal("250");
        }
        if ("LIFE".equalsIgnoreCase(type)) {
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

    public BigDecimal calcPremiumCopy2(String type, int age, int risk, int term) {
        BigDecimal base = new BigDecimal("200");
        if ("AUTO".equalsIgnoreCase(type)) {
            base = new BigDecimal("350");
        }
        if ("HOME".equalsIgnoreCase(type)) {
            base = new BigDecimal("250");
        }
        if ("LIFE".equalsIgnoreCase(type)) {
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
