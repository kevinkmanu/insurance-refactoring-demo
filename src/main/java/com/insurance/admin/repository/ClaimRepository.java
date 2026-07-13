package com.insurance.admin.repository;

import com.insurance.admin.entity.ClaimRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimRepository extends JpaRepository<ClaimRecord, Long> {
    List<ClaimRecord> findByPolicyId(Long policyId);
}
