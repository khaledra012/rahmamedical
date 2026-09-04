import React from 'react';
import './Table.css';
import { Spinner } from '../Spinner/Spinner';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'لا توجد بيانات متاحة حالياً',
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{ width: col.width, textAlign: col.align || 'right' }}
                className="table-th"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="table-loading-cell">
                <div className="table-loading-content">
                  <Spinner size="md" />
                  <span>جارٍ تحميل البيانات...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty-cell">
                <div className="table-empty-content">
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className={`table-row ${onRowClick ? 'table-row-clickable' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{ textAlign: col.align || 'right' }}
                    className="table-td"
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
