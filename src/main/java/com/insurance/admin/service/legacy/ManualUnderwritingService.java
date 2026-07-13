package com.insurance.admin.service.legacy;

import com.insurance.admin.entity.CustomerRecord;

public class ManualUnderwritingService {

    public String decide(CustomerRecord customerRecord, String policyType) {
        int r = customerRecord != null && customerRecord.getRiskScore() != null ? customerRecord.getRiskScore() : 50;
        if ("AUTO".equalsIgnoreCase(policyType) && r > 85) {
            return "DECLINE";
        }
        if ("LIFE".equalsIgnoreCase(policyType) && r > 75) {
            return "REFER";
        }
        if (r > 95) {
            return "DECLINE";
        }
        return "APPROVE";
    }
}
