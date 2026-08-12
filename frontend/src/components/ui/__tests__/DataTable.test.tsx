import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '../DataTable';

describe('DataTable', () => {
  it('renders accessible rows and supports interactive cell actions', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DataTable
        caption="Customer directory"
        rows={[{ id: 1, name: 'Jane Doe' }, { id: 2, name: 'John Smith' }]}
        rowKey={(row) => String(row.id)}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Customer', render: (value, row) => <button onClick={() => onSelect(row.id)}>{value}</button> },
        ]}
      />,
    );

    expect(screen.getByRole('table', { name: 'Customer directory' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Jane Doe' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
