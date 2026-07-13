package com.insurance.admin.controller;

import com.insurance.admin.entity.PolicyRecord;
import com.insurance.admin.service.PolicyService;
import com.insurance.admin.service.legacy.ManualUnderwritingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;
    private final ManualUnderwritingService manualUnderwritingService = new ManualUnderwritingService();

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @PostMapping
    public PolicyRecord createPolicy(@RequestBody PolicyRecord policyRecord,
                                     @RequestParam(required = false) Integer age,
                                     @RequestParam(required = false) Integer termMonths) {
        PolicyRecord created = policyService.createPolicyAndEverything(policyRecord, age, termMonths);
        if (created != null) {
            String decision = manualUnderwritingService.decide(null, created.getPolicyType());
            if ("DECLINE".equalsIgnoreCase(decision)) {
                created.setStatus("MANUAL_CHECK");
            }
        }
        return created;
    }

    @GetMapping("/{id}")
    public PolicyRecord findOne(@PathVariable Long id) {
        return policyService.findOne(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<PolicyRecord> byCustomer(@PathVariable Long customerId) {
        return policyService.findByCustomer(customerId);
    }

    @GetMapping("/sql/{customerId}")
    public List<Map<String, Object>> sqlView(@PathVariable Long customerId) {
        return policyService.runAdhocPolicySql(customerId);
    }
}
