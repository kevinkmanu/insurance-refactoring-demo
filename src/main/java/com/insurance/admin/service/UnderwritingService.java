package com.insurance.admin.service;

import com.insurance.admin.entity.CustomerRecord;
import org.springframework.stereotype.Service;

@Service
public class UnderwritingService {

    public String runDecision(CustomerRecord customerRecord, String policyType) {
        int risk = customerRecord != null && customerRecord.getRiskScore() != null ? customerRecord.getRiskScore() : 50;
        if ("LIFE".equalsIgnoreCase(policyType) && risk > 70) {
            return "REFER";
        }
        if ("AUTO".equalsIgnoreCase(policyType) && risk > 80) {
            return "DECLINE";
        }
        if (risk > 90) {
            return "DECLINE";
        }
        return "APPROVE";
    }
}
