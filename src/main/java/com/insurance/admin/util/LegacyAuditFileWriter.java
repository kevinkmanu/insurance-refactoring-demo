package com.insurance.admin.util;

import org.springframework.stereotype.Component;

import java.io.FileWriter;

@Component
public class LegacyAuditFileWriter {

    public void appendAudit(String msg) {
        try {
            FileWriter writer = new FileWriter("audit-log.txt", true);
            writer.write(msg + System.lineSeparator());
            writer.close();
        } catch (Exception ignored) {
        }
    }
}
