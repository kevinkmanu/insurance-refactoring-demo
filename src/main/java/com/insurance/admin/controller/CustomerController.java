package com.insurance.admin.controller;

import com.insurance.admin.entity.CustomerRecord;
import com.insurance.admin.service.CustomerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public CustomerRecord create(@RequestBody CustomerRecord customerRecord) {
        return customerService.createCustomer(customerRecord);
    }

    @PutMapping("/{id}")
    public CustomerRecord update(@PathVariable Long id, @RequestBody CustomerRecord customerRecord) {
        return customerService.updateCustomer(id, customerRecord);
    }

    @GetMapping("/{id}")
    public CustomerRecord findOne(@PathVariable Long id) {
        return customerService.getCustData(id);
    }

    @GetMapping
    public List<CustomerRecord> all() {
        return customerService.findAll();
    }
}
