package com.insurance.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.admin.entity.CustomerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void customerAndUnderwritingWorkflow_shouldWork() throws Exception {
        CustomerRecord customer = new CustomerRecord();
        customer.setCustNm("Mina");
        customer.setEmail("mina@example.com");
        customer.setRiskScore(35);

        String customerJson = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = objectMapper.readTree(customerJson).get("id").asLong();

        mockMvc.perform(post("/api/underwriting/decision")
                        .param("customerId", String.valueOf(id))
                        .param("policyType", "AUTO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decision").exists());
    }
}
