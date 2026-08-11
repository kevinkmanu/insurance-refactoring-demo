package com.insurance.admin;

import com.insurance.admin.entity.BillingRecord;
import com.insurance.admin.entity.ClaimRecord;
import com.insurance.admin.entity.PolicyRecord;
import com.insurance.admin.repository.BillingRepository;
import com.insurance.admin.repository.ClaimRepository;
import com.insurance.admin.repository.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WorklistEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private BillingRepository billingRepository;

    @BeforeEach
    void setUp() {
        billingRepository.deleteAll();
        claimRepository.deleteAll();
        policyRepository.deleteAll();
    }

    @Test
    void worklistEndpoints_shouldReturnPersistedRecords() throws Exception {
        PolicyRecord policy = new PolicyRecord();
        policy.setCustomerId(101L);
        policy.setPolicyType("AUTO");
        policy.setPremium(new BigDecimal("350.00"));
        policyRepository.save(policy);

        ClaimRecord claim = new ClaimRecord();
        claim.setPolicyId(policy.getPolicy_id());
        claim.setClaimAmount(new BigDecimal("250.00"));
        claimRepository.save(claim);

        BillingRecord billing = new BillingRecord();
        billing.setPolicyId(policy.getPolicy_id());
        billing.setAmount(new BigDecimal("350.00"));
        billingRepository.save(billing);

        mockMvc.perform(get("/api/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].policy_id").value(policy.getPolicy_id()));

        mockMvc.perform(get("/api/claims"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(claim.getId()));

        mockMvc.perform(get("/api/billing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(billing.getId()));
    }
}
