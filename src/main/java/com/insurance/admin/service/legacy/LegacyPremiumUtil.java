package com.insurance.admin.service.legacy;

import com.insurance.admin.service.pricing.PremiumCalculator;

import java.math.BigDecimal;

public class LegacyPremiumUtil {

    private final PremiumCalculator premiumCalculator;

    public LegacyPremiumUtil() {
        this(new PremiumCalculator());
    }

    public LegacyPremiumUtil(PremiumCalculator premiumCalculator) {
        this.premiumCalculator = premiumCalculator;
    }

    public BigDecimal calcPremiumCopy1(String type, int age, int risk, int term) {
        return premiumCalculator.calculate(type, age, risk, term);
    }

    public BigDecimal calcPremiumCopy2(String type, int age, int risk, int term) {
        return premiumCalculator.calculate(type, age, risk, term);
    }
}
