package com.insurance.admin.service.pricing;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PremiumCalculatorTest {

    private final PremiumCalculator premiumCalculator = new PremiumCalculator();

    @Test
    void calculate_shouldReturnExpectedPremiumForAuto() {
        BigDecimal result = premiumCalculator.calculate("AUTO", 38, 42, 12);

        assertEquals(new BigDecimal("350"), result);
    }

    @Test
    void calculate_shouldApplyAllAdjustments() {
        BigDecimal result = premiumCalculator.calculate("LIFE", 50, 75, 36);

        assertEquals(new BigDecimal("705"), result);
    }

    @Test
    void calculate_shouldUseDefaultBaseForUnknownType() {
        BigDecimal result = premiumCalculator.calculate("BOAT", 30, 20, 12);

        assertEquals(new BigDecimal("200"), result);
    }
}
