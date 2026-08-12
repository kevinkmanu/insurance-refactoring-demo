import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['ACTIVE', 'Active', 'success'],
    ['PENDING_REVIEW', 'PENDING REVIEW', 'warning'],
    ['OVERDUE', 'Overdue', 'danger'],
    ['unknown_status', 'unknown status', 'neutral'],
  ])('renders backend status %s accessibly', (status, label, variant) => {
    render(<StatusBadge status={status} />);

    const badge = screen.getByRole('status', { name: label });
    expect(badge).toHaveClass(`status-badge--${variant}`);
    expect(badge).toHaveTextContent(label);
  });
});
