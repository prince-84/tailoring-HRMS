'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download, Filter } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: string;
  title?: string;
  actionButton?: React.ReactNode;
  filterOptions?: {
    key: string;
    label: string;
    options: { label: string; value: string }[];
    onFilterChange: (value: string) => void;
  };
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  title,
  actionButton,
  filterOptions,
  isLoading = false,
  emptyMessage = 'No records found matching criteria.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Filter & Search
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const val = searchKey ? item[searchKey] : JSON.stringify(item);
    return String(val).toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCSV = () => {
    const headers = columns.map((c) => c.header).join(',');
    const rows = sortedData.map((item) =>
      columns.map((c) => `"${String(item[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E6E9F0] shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E9F0]">
        <div>
          {title && <h3 className="font-display font-bold text-lg text-[#18213A]">{title}</h3>}
          <p className="text-xs text-[#68708A] mt-0.5">Showing {sortedData.length} total records</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#9AA1B5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs text-[#18213A] placeholder-[#9AA1B5] focus:outline-none focus:border-[#B8862E] focus:bg-white transition"
            />
          </div>

          {/* Optional Filter */}
          {filterOptions && (
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#68708A]" />
              <select
                onChange={(e) => filterOptions.onFilterChange(e.target.value)}
                className="bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs py-1.5 px-2.5 text-[#18213A] focus:outline-none focus:border-[#B8862E]"
              >
                <option value="">All {filterOptions.label}</option>
                {filterOptions.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E9F0] text-xs font-medium text-[#18213A] hover:bg-[#F2F4F8] hover:border-[#B8862E] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#B8862E]" />
            <span>Export CSV</span>
          </button>

          {/* Action Button */}
          {actionButton}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F2F4F8] text-[#68708A] text-[11px] font-semibold tracking-wider uppercase border-b border-[#E6E9F0]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`py-3.5 px-4 font-semibold ${
                    col.sortable !== false ? 'cursor-pointer hover:text-[#18213A] select-none' : ''
                  } ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`flex items-center gap-1 ${
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable !== false && <ArrowUpDown className="w-3 h-3 text-[#9AA1B5]" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E9F0] text-sm text-[#18213A]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#9AA1B5]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#B8862E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#9AA1B5]">
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id ?? idx} className="hover:bg-[#F2F4F8]/50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#E6E9F0] flex items-center justify-between text-xs text-[#68708A] bg-white">
        <div>
          Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#E6E9F0] hover:bg-[#F2F4F8] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-medium text-[#18213A]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E6E9F0] hover:bg-[#F2F4F8] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
