package com.insurance.admin;

import com.insurance.admin.entity.ClaimRecord;
import com.insurance.admin.entity.CustomerRecord;
import com.insurance.admin.entity.PolicyRecord;
import com.insurance.admin.repository.CustomerRepository;
import com.insurance.admin.service.ClaimsService;
import com.insurance.admin.service.PolicyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class ClaimsServiceLegacyTest {

    @Autowired
    private ClaimsService claimsService;

    @Autowired
    private PolicyService policyService;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    void submitClaimAndDoEverything_shouldSaveClaim() {
        CustomerRecord customer = new CustomerRecord();
        customer.setCustNm("Raj");
        customer.setRiskScore(60);
        customer = customerRepository.save(customer);

        PolicyRecord policy = new PolicyRecord();
        policy.setCustomerId(customer.getId());
        policy.setPolicyType("HOME");
        PolicyRecord savedPolicy = policyService.createPolicyAndEverything(policy, 39, 24);

        ClaimRecord claim = new ClaimRecord();
        claim.setPolicyId(savedPolicy.getPolicy_id());
        claim.setClaimReason("Water damage");
        claim.setClaimAmount(new BigDecimal("2400"));
        claim.setIncidentDate(LocalDate.now().minusDays(5));

        ClaimRecord savedClaim = claimsService.submitClaimAndDoEverything(claim, "adjuster1", 4);

        assertNotNull(savedClaim);
        assertNotNull(savedClaim.getId());
        assertNotNull(savedClaim.getStatus());
    }
}
