import './DataTable.css';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
}

import React from 'react';

export function DataTable<T>({ columns, rows, rowKey, caption }: Props<T>) {
  return (
    <div className="datatable-wrapper" role="region" aria-label={caption} tabIndex={0}>
      <table className="datatable">
        {caption && <caption className="datatable__caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} scope="col" style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
