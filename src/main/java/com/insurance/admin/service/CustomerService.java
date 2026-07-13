package com.insurance.admin.service;

import com.insurance.admin.entity.CustomerRecord;
import com.insurance.admin.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerRecord createCustomer(CustomerRecord customerRecord) {
        if (customerRecord.getCustNm() == null || customerRecord.getCustNm().isBlank()) {
            customerRecord.setCustNm("UNKNOWN");
        }
        if (customerRecord.getRiskScore() == null) {
            customerRecord.setRiskScore(50);
        }
        return customerRepository.save(customerRecord);
    }

    public CustomerRecord updateCustomer(Long id, CustomerRecord input) {
        Optional<CustomerRecord> existing = customerRepository.findById(id);
        if (existing.isPresent()) {
            CustomerRecord found = existing.get();
            if (input.getCustNm() != null) {
                found.setCustNm(input.getCustNm());
            }
            if (input.getEmail() != null) {
                found.setEmail(input.getEmail());
            }
            if (input.getPhone_no() != null) {
                found.setPhone_no(input.getPhone_no());
            }
            if (input.getAddress() != null) {
                found.setAddress(input.getAddress());
            }
            if (input.getRiskScore() != null) {
                found.setRiskScore(input.getRiskScore());
            }
            return customerRepository.save(found);
        }
        input.setId(id);
        return customerRepository.save(input);
    }

    public CustomerRecord getCustData(Long id) {
        return customerRepository.findById(id).orElse(null);
    }

    public List<CustomerRecord> findAll() {
        return customerRepository.findAll();
    }
}
