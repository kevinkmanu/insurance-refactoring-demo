package com.insurance.admin.service;

import com.insurance.admin.repository.CustomerRepository;
import com.insurance.admin.repository.PolicyRepository;
import com.insurance.admin.service.legacy.LegacyPremiumUtil;
import com.insurance.admin.service.pricing.PremiumCalculator;
import com.insurance.admin.util.LegacyAuditFileWriter;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class PremiumRuleParityTest {

    private final PremiumCalculator premiumCalculator = new PremiumCalculator();

    @Test
    void allLegacyPremiumEntryPoints_shouldReturnSameResult() {
        PolicyService policyService = new PolicyService(
                mock(PolicyRepository.class),
                mock(CustomerRepository.class),
                mock(JdbcTemplate.class),
                mock(LegacyAuditFileWriter.class),
                premiumCalculator
        );

        LegacyPremiumUtil legacyPremiumUtil = new LegacyPremiumUtil(premiumCalculator);

        BigDecimal fromCopy1 = legacyPremiumUtil.calcPremiumCopy1("HOME", 47, 71, 25);
        BigDecimal fromCopy2 = legacyPremiumUtil.calcPremiumCopy2("HOME", 47, 71, 25);
        BigDecimal fromPolicyMethod1 = policyService.duplicatedPremiumCalc("HOME", 47, 71, 25);
        BigDecimal fromPolicyMethod2 = policyService.calcPremAgain("HOME", 47, 71, 25);

        assertEquals(fromCopy1, fromCopy2);
        assertEquals(fromCopy1, fromPolicyMethod1);
        assertEquals(fromCopy1, fromPolicyMethod2);
    }
}
