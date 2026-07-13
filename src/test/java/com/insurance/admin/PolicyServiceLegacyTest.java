package com.insurance.admin;

import com.insurance.admin.entity.CustomerRecord;
import com.insurance.admin.entity.PolicyRecord;
import com.insurance.admin.repository.CustomerRepository;
import com.insurance.admin.service.PolicyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PolicyServiceLegacyTest {

    @Autowired
    private PolicyService policyService;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    void createPolicyAndEverything_shouldPersistPolicyWithPremium() {
        CustomerRecord customer = new CustomerRecord();
        customer.setCustNm("Anita");
        customer.setRiskScore(45);
        customer = customerRepository.save(customer);

        PolicyRecord policy = new PolicyRecord();
        policy.setCustomerId(customer.getId());
        policy.setPolicyType("AUTO");

        PolicyRecord saved = policyService.createPolicyAndEverything(policy, 42, 12);

        assertNotNull(saved);
        assertNotNull(saved.getPolicy_id());
        assertNotNull(saved.getPremium());
        assertTrue(saved.getPremium().compareTo(BigDecimal.ZERO) > 0);
    }
}
