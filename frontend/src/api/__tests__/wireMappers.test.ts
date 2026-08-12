import { describe, it, expect } from 'vitest';
import { fromWire as customerFromWire, toWire as customerToWire } from '../customers';
import { fromWire as policyFromWire, toWire as policyToWire } from '../policies';
import { fromWire as claimFromWire, toWire as claimToWire } from '../claims';
import { fromWire as billingFromWire, toWire as billingToWire } from '../billing';
import { fromWire as uwFromWire } from '../underwriting';

describe('Customer wire mappers', () => {
  const wire = { id: 1, custNm: 'Jane Doe', email: 'jane@example.com', phone_no: '555-1234', address: '1 Main St', riskScore: 3 };

  it('fromWire maps custNm -> name and phone_no -> phone', () => {
    const domain = customerFromWire(wire);
    expect(domain.name).toBe('Jane Doe');
    expect(domain.phone).toBe('555-1234');
    expect(domain.email).toBe('jane@example.com');
    // ensure legacy wire fields are absent on domain type
    expect(Object.keys(domain)).not.toContain('custNm');
    expect(Object.keys(domain)).not.toContain('phone_no');
  });

  it('toWire maps name -> custNm and phone -> phone_no', () => {
    const domain = customerFromWire(wire);
    const back = customerToWire(domain);
    expect(back.custNm).toBe('Jane Doe');
    expect(back.phone_no).toBe('555-1234');
  });

  it('round-trip is lossless', () => {
    const domain = customerFromWire(wire);
    const back = customerToWire(domain);
    expect(back).toEqual(wire);
  });
});

describe('Policy wire mappers', () => {
  const wire = { policy_id: 10, customerId: 1, policyType: 'AUTO', premium: '750.00', status: 'active', startDate: '2024-01-01', endDate: '2025-01-01', underwritingDecision: 'APPROVE' };

  it('fromWire maps policy_id -> id and premium to number', () => {
    const domain = policyFromWire(wire);
    expect(domain.id).toBe(10);
    expect(domain.premium).toBe(750);
    expect(Object.keys(domain)).not.toContain('policy_id');
  });

  it('toWire maps id -> policy_id', () => {
    const domain = policyFromWire(wire);
    const back = policyToWire(domain);
    expect(back.policy_id).toBe(10);
  });
});

describe('Claim wire mappers', () => {
  const wire = { id: 5, policyId: 10, claimAmount: '2500.50', claimReason: 'Accident', status: 'open', incidentDate: '2024-03-15' };

  it('fromWire converts claimAmount to number', () => {
    const domain = claimFromWire(wire);
    expect(domain.claimAmount).toBe(2500.50);
  });

  it('round-trip preserves all fields', () => {
    const domain = claimFromWire(wire);
    const back = claimToWire(domain);
    expect(back.policyId).toBe(10);
    expect(back.claimReason).toBe('Accident');
  });
});

describe('Billing wire mappers', () => {
  const wire = { id: 3, policyId: 10, amount: '300.00', paymentStatus: 'paid', dueDate: '2024-02-01', paidDate: '2024-01-28' };

  it('fromWire converts amount to number', () => {
    const domain = billingFromWire(wire);
    expect(domain.amount).toBe(300);
  });

  it('toWire preserves all wire fields', () => {
    const domain = billingFromWire(wire);
    const back = billingToWire(domain);
    expect(back.paymentStatus).toBe('paid');
    expect(back.policyId).toBe(10);
  });
});

describe('Underwriting wire mapper', () => {
  const wire = { customerId: 1, policyType: 'HOME', decision: 'APPROVE' };

  it('fromWire is a pass-through (wire and domain field names match)', () => {
    const domain = uwFromWire(wire);
    expect(domain.decision).toBe('APPROVE');
    expect(domain.customerId).toBe(1);
    expect(domain.policyType).toBe('HOME');
  });
});
