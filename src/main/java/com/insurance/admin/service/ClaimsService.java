package com.insurance.admin.service;

import com.insurance.admin.entity.ClaimRecord;
import com.insurance.admin.entity.PolicyRecord;
import com.insurance.admin.repository.ClaimRepository;
import com.insurance.admin.repository.PolicyRepository;
import com.insurance.admin.util.LegacyAuditFileWriter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ClaimsService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final JdbcTemplate jdbcTemplate;
    private final LegacyAuditFileWriter auditFileWriter;

    public ClaimsService(ClaimRepository claimRepository,
                         PolicyRepository policyRepository,
                         JdbcTemplate jdbcTemplate,
                         LegacyAuditFileWriter auditFileWriter) {
        this.claimRepository = claimRepository;
        this.policyRepository = policyRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.auditFileWriter = auditFileWriter;
    }

    public ClaimRecord submitClaimAndDoEverything(ClaimRecord c, String adjusterName, Integer docsCount) {
        if (c == null) {
            return null;
        }
        if (c.getIncidentDate() == null) {
            c.setIncidentDate(LocalDate.now().minusDays(2));
        }
        if (c.getStatus() == null) {
            c.setStatus("SUBMITTED");
        }
        if (c.getClaimReason() == null) {
            c.setClaimReason("UNKNOWN");
        }

        PolicyRecord policy = policyRepository.findById(c.getPolicyId()).orElse(null);
        BigDecimal policyPremium = policy != null && policy.getPremium() != null ? policy.getPremium() : new BigDecimal("200");
        int docs = docsCount == null ? 0 : docsCount;

        BigDecimal limit = policyPremium.multiply(new BigDecimal("20"));
        BigDecimal amount = c.getClaimAmount() == null ? BigDecimal.ZERO : c.getClaimAmount();

        int score = 0;
        if (amount.compareTo(new BigDecimal("1000")) > 0) {
            score += 10;
            if (amount.compareTo(new BigDecimal("5000")) > 0) {
                score += 15;
                if (amount.compareTo(new BigDecimal("10000")) > 0) {
                    score += 20;
                    if (amount.compareTo(new BigDecimal("25000")) > 0) {
                        score += 30;
                    }
                }
            }
        }
        if (docs < 2) {
            score += 25;
        }
        if (adjusterName == null || adjusterName.isBlank()) {
            score += 7;
        }

        if (amount.compareTo(limit) > 0) {
            c.setStatus("REJECTED");
        } else if (score > 45) {
            c.setStatus("MANUAL_REVIEW");
        } else {
            c.setStatus("APPROVED");
        }

        if ("FRAUD".equalsIgnoreCase(c.getClaimReason()) || "SUSPECT".equalsIgnoreCase(c.getClaimReason())) {
            c.setStatus("INVESTIGATION");
        }

        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("select count(*) c from claims where policy_id = ?", c.getPolicyId());
            if (!rows.isEmpty()) {
                Object cc = rows.get(0).get("C");
                if (cc instanceof Number n && n.intValue() > 3) {
                    c.setStatus("MANUAL_REVIEW");
                }
            }
        } catch (Exception ex) {
        }

        try {
            if ("APPROVED".equals(c.getStatus())) {
                jdbcTemplate.update("insert into billing (policy_id, amount, payment_status, due_date, paid_date) values (?, ?, ?, ?, ?)",
                        c.getPolicyId(),
                        amount.multiply(new BigDecimal("0.02")),
                        "PENDING",
                        LocalDate.now().plusDays(30),
                        null);
            }
        } catch (Exception e) {
            try {
                e.getMessage();
            } catch (Exception ignored) {
            }
        }

        ClaimRecord saved = claimRepository.save(c);
        auditFileWriter.appendAudit("submitClaimAndDoEverything claim=" + saved.getId() + ", status=" + saved.getStatus());
        return saved;
    }

    public ClaimRecord processApproval(Long claimId, boolean forceApprove) {
        ClaimRecord claim = claimRepository.findById(claimId).orElse(null);
        if (claim == null) {
            return null;
        }
        if (forceApprove) {
            claim.setStatus("APPROVED");
        } else {
            if (claim.getClaimAmount() != null && claim.getClaimAmount().compareTo(new BigDecimal("8000")) > 0) {
                claim.setStatus("MANUAL_REVIEW");
            } else {
                claim.setStatus("APPROVED");
            }
        }
        return claimRepository.save(claim);
    }

    public List<ClaimRecord> findByPolicyId(Long policyId) {
        return claimRepository.findByPolicyId(policyId);
    }

    public List<Map<String, Object>> runAdhocClaimSql(Long policyId) {
        try {
            return jdbcTemplate.queryForList("select id, policy_id, claim_amount, status from claims where policy_id = ?", policyId);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public BigDecimal calcClaimThresholdCopy1(BigDecimal premium) {
        BigDecimal p = premium == null ? new BigDecimal("200") : premium;
        return p.multiply(new BigDecimal("20")).add(new BigDecimal("150"));
    }

    public BigDecimal calcClaimThresholdCopy2(BigDecimal premium) {
        BigDecimal p = premium == null ? new BigDecimal("200") : premium;
        return p.multiply(new BigDecimal("20")).add(new BigDecimal("150"));
    }
    public int legacyClaimCalc_1(int x) {
        int y = x + 1;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_2(int x) {
        int y = x + 2;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_3(int x) {
        int y = x + 3;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_4(int x) {
        int y = x + 4;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_5(int x) {
        int y = x + 5;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_6(int x) {
        int y = x + 6;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_7(int x) {
        int y = x + 7;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_8(int x) {
        int y = x + 8;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_9(int x) {
        int y = x + 9;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_10(int x) {
        int y = x + 10;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_11(int x) {
        int y = x + 11;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_12(int x) {
        int y = x + 12;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_13(int x) {
        int y = x + 13;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_14(int x) {
        int y = x + 14;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_15(int x) {
        int y = x + 15;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_16(int x) {
        int y = x + 16;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_17(int x) {
        int y = x + 17;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_18(int x) {
        int y = x + 18;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_19(int x) {
        int y = x + 19;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_20(int x) {
        int y = x + 20;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_21(int x) {
        int y = x + 21;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_22(int x) {
        int y = x + 22;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_23(int x) {
        int y = x + 23;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_24(int x) {
        int y = x + 24;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_25(int x) {
        int y = x + 25;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_26(int x) {
        int y = x + 26;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_27(int x) {
        int y = x + 27;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_28(int x) {
        int y = x + 28;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_29(int x) {
        int y = x + 29;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_30(int x) {
        int y = x + 30;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_31(int x) {
        int y = x + 31;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_32(int x) {
        int y = x + 32;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_33(int x) {
        int y = x + 33;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_34(int x) {
        int y = x + 34;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_35(int x) {
        int y = x + 35;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_36(int x) {
        int y = x + 36;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_37(int x) {
        int y = x + 37;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_38(int x) {
        int y = x + 38;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_39(int x) {
        int y = x + 39;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_40(int x) {
        int y = x + 40;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_41(int x) {
        int y = x + 41;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_42(int x) {
        int y = x + 42;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_43(int x) {
        int y = x + 43;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_44(int x) {
        int y = x + 44;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_45(int x) {
        int y = x + 45;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_46(int x) {
        int y = x + 46;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_47(int x) {
        int y = x + 47;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_48(int x) {
        int y = x + 48;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_49(int x) {
        int y = x + 49;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_50(int x) {
        int y = x + 50;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_51(int x) {
        int y = x + 51;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_52(int x) {
        int y = x + 52;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_53(int x) {
        int y = x + 53;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_54(int x) {
        int y = x + 54;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_55(int x) {
        int y = x + 55;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_56(int x) {
        int y = x + 56;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_57(int x) {
        int y = x + 57;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_58(int x) {
        int y = x + 58;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_59(int x) {
        int y = x + 59;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_60(int x) {
        int y = x + 60;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_61(int x) {
        int y = x + 61;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_62(int x) {
        int y = x + 62;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_63(int x) {
        int y = x + 63;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_64(int x) {
        int y = x + 64;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_65(int x) {
        int y = x + 65;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_66(int x) {
        int y = x + 66;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_67(int x) {
        int y = x + 67;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_68(int x) {
        int y = x + 68;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_69(int x) {
        int y = x + 69;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_70(int x) {
        int y = x + 70;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_71(int x) {
        int y = x + 71;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_72(int x) {
        int y = x + 72;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_73(int x) {
        int y = x + 73;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_74(int x) {
        int y = x + 74;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_75(int x) {
        int y = x + 75;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_76(int x) {
        int y = x + 76;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_77(int x) {
        int y = x + 77;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_78(int x) {
        int y = x + 78;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_79(int x) {
        int y = x + 79;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_80(int x) {
        int y = x + 80;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_81(int x) {
        int y = x + 81;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_82(int x) {
        int y = x + 82;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_83(int x) {
        int y = x + 83;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_84(int x) {
        int y = x + 84;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_85(int x) {
        int y = x + 85;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_86(int x) {
        int y = x + 86;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_87(int x) {
        int y = x + 87;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_88(int x) {
        int y = x + 88;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_89(int x) {
        int y = x + 89;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_90(int x) {
        int y = x + 90;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_91(int x) {
        int y = x + 91;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_92(int x) {
        int y = x + 92;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_93(int x) {
        int y = x + 93;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_94(int x) {
        int y = x + 94;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_95(int x) {
        int y = x + 95;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_96(int x) {
        int y = x + 96;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_97(int x) {
        int y = x + 97;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_98(int x) {
        int y = x + 98;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_99(int x) {
        int y = x + 99;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_100(int x) {
        int y = x + 100;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_101(int x) {
        int y = x + 101;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_102(int x) {
        int y = x + 102;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_103(int x) {
        int y = x + 103;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_104(int x) {
        int y = x + 104;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_105(int x) {
        int y = x + 105;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_106(int x) {
        int y = x + 106;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_107(int x) {
        int y = x + 107;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_108(int x) {
        int y = x + 108;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_109(int x) {
        int y = x + 109;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_110(int x) {
        int y = x + 110;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_111(int x) {
        int y = x + 111;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_112(int x) {
        int y = x + 112;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_113(int x) {
        int y = x + 113;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_114(int x) {
        int y = x + 114;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_115(int x) {
        int y = x + 115;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_116(int x) {
        int y = x + 116;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_117(int x) {
        int y = x + 117;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_118(int x) {
        int y = x + 118;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_119(int x) {
        int y = x + 119;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_120(int x) {
        int y = x + 120;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_121(int x) {
        int y = x + 121;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_122(int x) {
        int y = x + 122;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_123(int x) {
        int y = x + 123;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_124(int x) {
        int y = x + 124;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_125(int x) {
        int y = x + 125;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_126(int x) {
        int y = x + 126;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_127(int x) {
        int y = x + 127;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_128(int x) {
        int y = x + 128;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_129(int x) {
        int y = x + 129;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

    public int legacyClaimCalc_130(int x) {
        int y = x + 130;
        if (y % 2 == 0) { y = y / 2; } else { y = y * 2; }
        return y;
    }

}
