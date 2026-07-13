package com.insurance.admin.repository;

import com.insurance.admin.entity.CustomerRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<CustomerRecord, Long> {
}
