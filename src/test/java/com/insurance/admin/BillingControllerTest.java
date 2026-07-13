package com.insurance.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.admin.entity.BillingRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BillingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void processPayment_shouldSetPaidDateWhenStatusPaid() throws Exception {
        BillingRecord billingRecord = new BillingRecord();
        billingRecord.setPolicyId(999L);
        billingRecord.setAmount(new BigDecimal("222.50"));
        billingRecord.setDueDate(LocalDate.now().plusDays(10));
        billingRecord.setPaymentStatus("PAID");

        mockMvc.perform(post("/api/billing/payment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(billingRecord)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidDate").exists());
    }
}
