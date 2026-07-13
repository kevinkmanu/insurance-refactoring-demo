package com.insurance.admin.repository;

import com.insurance.admin.entity.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillingRepository extends JpaRepository<BillingRecord, Long> {
    List<BillingRecord> findByPolicyId(Long policyId);
}
