import React from 'react';
import { getSortIcon } from '../utils/sorting';

const Table = ({ columns, data, sortConfig, onSort, emptyMessage = "No data available" }) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className="overflow-x-auto w-full responsive-table rounded-lg shadow">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-300 text-base-content">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${column.sortable ? 'cursor-pointer hover:bg-base-200' : ''}`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="text-xs opacity-70">
                      {getSortIcon(column.key, sortConfig)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className="hover:bg-base-200/50"
              >
                {columns.map((column) => (
                  <td key={`${row.id || index}-${column.key}`} className="whitespace-normal py-2">
                    <div className="md:py-1">
                      {/* Responsive display for mobile - show label: value format */}
                      <div className="block md:hidden">
                        <span className="font-medium">{column.label}: </span>
                        {column.render ? column.render(row) : row[column.key]}
                      </div>

                      {/* Standard display for desktop */}
                      <div className="hidden md:block">
                        {column.render ? column.render(row) : row[column.key]}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;