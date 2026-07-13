package com.insurance.admin.controller;

import com.insurance.admin.entity.ClaimRecord;
import com.insurance.admin.service.ClaimsService;
import com.insurance.admin.service.legacy.ManualUnderwritingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
public class ClaimsController {

    private final ClaimsService claimsService;

    public ClaimsController(ClaimsService claimsService) {
        this.claimsService = claimsService;
    }

    @PostMapping
    public ClaimRecord submit(@RequestBody ClaimRecord claimRecord,
                              @RequestParam(required = false) String adjuster,
                              @RequestParam(required = false) Integer docs) {
        ManualUnderwritingService localServiceCreatedWithNew = new ManualUnderwritingService();
        String decision = localServiceCreatedWithNew.decide(null, "AUTO");
        if ("DECLINE".equalsIgnoreCase(decision) && claimRecord.getClaimReason() == null) {
            claimRecord.setClaimReason("AUTO_ADJUST");
        }
        return claimsService.submitClaimAndDoEverything(claimRecord, adjuster, docs);
    }

    @PostMapping("/{id}/approve")
    public ClaimRecord approve(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean force) {
        return claimsService.processApproval(id, force);
    }

    @GetMapping("/policy/{policyId}")
    public List<ClaimRecord> byPolicy(@PathVariable Long policyId) {
        return claimsService.findByPolicyId(policyId);
    }

    @GetMapping("/sql/{policyId}")
    public List<Map<String, Object>> sqlView(@PathVariable Long policyId) {
        return claimsService.runAdhocClaimSql(policyId);
    }
}
