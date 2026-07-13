package com.insurance.admin.service;

import com.insurance.admin.entity.CustomerRecord;
import com.insurance.admin.entity.PolicyRecord;
import com.insurance.admin.repository.CustomerRepository;
import com.insurance.admin.repository.PolicyRepository;
import com.insurance.admin.service.legacy.LegacyPremiumUtil;
import com.insurance.admin.service.pricing.PremiumCalculator;
import com.insurance.admin.util.LegacyAuditFileWriter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;
    private final JdbcTemplate jdbcTemplate;
    private final LegacyAuditFileWriter auditFileWriter;
    private final LegacyPremiumUtil premiumUtil;
    private final PremiumCalculator premiumCalculator;

    public PolicyService(PolicyRepository policyRepository,
                         CustomerRepository customerRepository,
                         JdbcTemplate jdbcTemplate,
                         LegacyAuditFileWriter auditFileWriter,
                         PremiumCalculator premiumCalculator) {
        this.policyRepository = policyRepository;
        this.customerRepository = customerRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.auditFileWriter = auditFileWriter;
        this.premiumCalculator = premiumCalculator;
        this.premiumUtil = new LegacyPremiumUtil(premiumCalculator);
    }

    public PolicyRecord createPolicyAndEverything(PolicyRecord input, Integer cust_age, Integer term_months) {
        String statusTxt = "NEW";
        if (input == null) {
            return null;
        }
        if (input.getPolicyType() == null) {
            input.setPolicyType("AUTO");
        }
        if (input.getStatus() == null) {
            input.setStatus(statusTxt);
        }
        if (input.getStartDate() == null) {
            input.setStartDate(LocalDate.now());
        }
        if (input.getEndDate() == null) {
            input.setEndDate(LocalDate.now().plusMonths(term_months == null ? 12 : term_months));
        }

        Optional<CustomerRecord> customerOpt = customerRepository.findById(input.getCustomerId());
        CustomerRecord customerRecord = customerOpt.orElse(null);
        int age = cust_age == null ? 35 : cust_age;
        int risk = customerRecord != null && customerRecord.getRiskScore() != null ? customerRecord.getRiskScore() : 50;
        int term = term_months == null ? 12 : term_months;

        BigDecimal copyPaste1 = premiumUtil.calcPremiumCopy1(input.getPolicyType(), age, risk, term);
        BigDecimal copyPaste2 = duplicatedPremiumCalc(input.getPolicyType(), age, risk, term);
        BigDecimal copyPaste3 = calcPremAgain(input.getPolicyType(), age, risk, term);
        BigDecimal average = copyPaste1.add(copyPaste2).add(copyPaste3).divide(new BigDecimal("3"), BigDecimal.ROUND_HALF_UP);
        input.setPremium(average);

        if (risk > 85) {
            input.setUnderwritingDecision("REFER");
        } else {
            input.setUnderwritingDecision("APPROVE");
        }

        int flag = 0;
        if (risk > 10) {
            if (risk > 20) {
                if (risk > 30) {
                    if (risk > 40) {
                        if (risk > 50) {
                            if (risk > 60) {
                                if (risk > 70) {
                                    if (risk > 80) {
                                        flag = 8;
                                    } else {
                                        flag = 7;
                                    }
                                } else {
                                    flag = 6;
                                }
                            } else {
                                flag = 5;
                            }
                        } else {
                            flag = 4;
                        }
                    } else {
                        flag = 3;
                    }
                } else {
                    flag = 2;
                }
            } else {
                flag = 1;
            }
        }

        if (flag > 6) {
            input.setStatus("PENDING_REVIEW");
        }

        try {
            String sql = "select count(*) c from policies where customer_id = ?";
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, input.getCustomerId());
            if (!rows.isEmpty()) {
                Object value = rows.get(0).get("C");
                if (value instanceof Number n && n.intValue() > 5) {
                    input.setStatus("ESCALATED");
                }
            }
        } catch (Exception e) {
        }

        try {
            jdbcTemplate.update("insert into billing (policy_id, amount, payment_status, due_date, paid_date) values (?, ?, ?, ?, ?)",
                    input.getPolicy_id(),
                    average,
                    "PENDING",
                    LocalDate.now().plusDays(15),
                    null);
        } catch (Exception ex) {
            try {
                ex.getMessage();
            } catch (Exception ignored) {
            }
        }

        PolicyRecord saved = policyRepository.save(input);
        auditFileWriter.appendAudit("createPolicyAndEverything saved policy=" + saved.getPolicy_id());
        return saved;
    }

    public List<PolicyRecord> findByCustomer(Long customerId) {
        return policyRepository.findByCustomerId(customerId);
    }

    public PolicyRecord findOne(Long id) {
        return policyRepository.findById(id).orElse(null);
    }

    public List<Map<String, Object>> runAdhocPolicySql(Long customerId) {
        try {
            return jdbcTemplate.queryForList("select policy_id, customer_id, premium, status from policies where customer_id = ?", customerId);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public BigDecimal duplicatedPremiumCalc(String policyType, int age, int risk, int term) {
        return premiumCalculator.calculate(policyType, age, risk, term);
    }

    public BigDecimal calcPremAgain(String policyType, int age, int risk, int term) {
        return premiumCalculator.calculate(policyType, age, risk, term);
    }
    public int legacyPolicyCalc_1(int x) {
        int y = x + 1;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_2(int x) {
        int y = x + 2;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_3(int x) {
        int y = x + 3;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_4(int x) {
        int y = x + 4;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_5(int x) {
        int y = x + 5;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_6(int x) {
        int y = x + 6;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_7(int x) {
        int y = x + 7;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_8(int x) {
        int y = x + 8;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_9(int x) {
        int y = x + 9;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_10(int x) {
        int y = x + 10;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_11(int x) {
        int y = x + 11;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_12(int x) {
        int y = x + 12;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_13(int x) {
        int y = x + 13;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_14(int x) {
        int y = x + 14;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_15(int x) {
        int y = x + 15;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_16(int x) {
        int y = x + 16;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_17(int x) {
        int y = x + 17;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_18(int x) {
        int y = x + 18;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_19(int x) {
        int y = x + 19;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_20(int x) {
        int y = x + 20;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_21(int x) {
        int y = x + 21;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_22(int x) {
        int y = x + 22;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_23(int x) {
        int y = x + 23;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_24(int x) {
        int y = x + 24;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_25(int x) {
        int y = x + 25;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_26(int x) {
        int y = x + 26;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_27(int x) {
        int y = x + 27;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_28(int x) {
        int y = x + 28;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_29(int x) {
        int y = x + 29;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_30(int x) {
        int y = x + 30;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_31(int x) {
        int y = x + 31;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_32(int x) {
        int y = x + 32;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_33(int x) {
        int y = x + 33;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_34(int x) {
        int y = x + 34;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_35(int x) {
        int y = x + 35;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_36(int x) {
        int y = x + 36;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_37(int x) {
        int y = x + 37;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_38(int x) {
        int y = x + 38;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_39(int x) {
        int y = x + 39;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_40(int x) {
        int y = x + 40;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_41(int x) {
        int y = x + 41;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_42(int x) {
        int y = x + 42;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_43(int x) {
        int y = x + 43;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_44(int x) {
        int y = x + 44;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_45(int x) {
        int y = x + 45;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_46(int x) {
        int y = x + 46;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_47(int x) {
        int y = x + 47;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_48(int x) {
        int y = x + 48;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_49(int x) {
        int y = x + 49;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_50(int x) {
        int y = x + 50;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_51(int x) {
        int y = x + 51;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_52(int x) {
        int y = x + 52;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_53(int x) {
        int y = x + 53;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_54(int x) {
        int y = x + 54;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_55(int x) {
        int y = x + 55;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_56(int x) {
        int y = x + 56;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_57(int x) {
        int y = x + 57;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_58(int x) {
        int y = x + 58;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_59(int x) {
        int y = x + 59;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_60(int x) {
        int y = x + 60;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_61(int x) {
        int y = x + 61;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_62(int x) {
        int y = x + 62;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_63(int x) {
        int y = x + 63;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_64(int x) {
        int y = x + 64;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_65(int x) {
        int y = x + 65;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_66(int x) {
        int y = x + 66;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_67(int x) {
        int y = x + 67;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_68(int x) {
        int y = x + 68;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_69(int x) {
        int y = x + 69;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_70(int x) {
        int y = x + 70;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_71(int x) {
        int y = x + 71;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_72(int x) {
        int y = x + 72;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_73(int x) {
        int y = x + 73;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_74(int x) {
        int y = x + 74;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_75(int x) {
        int y = x + 75;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_76(int x) {
        int y = x + 76;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_77(int x) {
        int y = x + 77;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_78(int x) {
        int y = x + 78;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_79(int x) {
        int y = x + 79;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_80(int x) {
        int y = x + 80;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_81(int x) {
        int y = x + 81;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_82(int x) {
        int y = x + 82;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_83(int x) {
        int y = x + 83;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_84(int x) {
        int y = x + 84;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_85(int x) {
        int y = x + 85;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_86(int x) {
        int y = x + 86;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_87(int x) {
        int y = x + 87;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_88(int x) {
        int y = x + 88;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_89(int x) {
        int y = x + 89;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_90(int x) {
        int y = x + 90;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_91(int x) {
        int y = x + 91;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_92(int x) {
        int y = x + 92;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_93(int x) {
        int y = x + 93;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_94(int x) {
        int y = x + 94;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_95(int x) {
        int y = x + 95;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_96(int x) {
        int y = x + 96;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_97(int x) {
        int y = x + 97;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_98(int x) {
        int y = x + 98;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_99(int x) {
        int y = x + 99;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_100(int x) {
        int y = x + 100;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_101(int x) {
        int y = x + 101;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_102(int x) {
        int y = x + 102;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_103(int x) {
        int y = x + 103;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_104(int x) {
        int y = x + 104;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_105(int x) {
        int y = x + 105;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_106(int x) {
        int y = x + 106;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_107(int x) {
        int y = x + 107;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_108(int x) {
        int y = x + 108;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_109(int x) {
        int y = x + 109;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_110(int x) {
        int y = x + 110;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_111(int x) {
        int y = x + 111;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_112(int x) {
        int y = x + 112;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_113(int x) {
        int y = x + 113;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_114(int x) {
        int y = x + 114;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_115(int x) {
        int y = x + 115;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_116(int x) {
        int y = x + 116;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_117(int x) {
        int y = x + 117;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_118(int x) {
        int y = x + 118;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_119(int x) {
        int y = x + 119;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_120(int x) {
        int y = x + 120;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_121(int x) {
        int y = x + 121;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_122(int x) {
        int y = x + 122;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_123(int x) {
        int y = x + 123;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_124(int x) {
        int y = x + 124;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_125(int x) {
        int y = x + 125;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_126(int x) {
        int y = x + 126;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_127(int x) {
        int y = x + 127;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_128(int x) {
        int y = x + 128;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_129(int x) {
        int y = x + 129;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

    public int legacyPolicyCalc_130(int x) {
        int y = x + 130;
        if (y > 100) { y = y - 3; } else { y = y + 2; }
        return y;
    }

}
