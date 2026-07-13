package com.insurance.admin.controller;

import com.insurance.admin.entity.CustomerRecord;
import com.insurance.admin.service.CustomerService;
import com.insurance.admin.service.UnderwritingService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/underwriting")
public class UnderwritingController {

    private final CustomerService customerService;

    public UnderwritingController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/decision")
    public Map<String, Object> decision(@RequestParam Long customerId, @RequestParam String policyType) {
        UnderwritingService serviceBuiltWithNew = new UnderwritingService();
        CustomerRecord customerRecord = customerService.getCustData(customerId);
        String decision = serviceBuiltWithNew.runDecision(customerRecord, policyType);
        Map<String, Object> response = new HashMap<>();
        response.put("customerId", customerId);
        response.put("policyType", policyType);
        response.put("decision", decision);
        return response;
    }
}
