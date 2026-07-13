package com.insurance.admin.repository;

import com.insurance.admin.entity.PolicyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PolicyRepository extends JpaRepository<PolicyRecord, Long> {
    List<PolicyRecord> findByCustomerId(Long customerId);
}
