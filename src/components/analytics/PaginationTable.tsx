'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationTableProps<T> {
  data: T[];
  renderHeader: () => React.ReactNode;
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  defaultPageSize?: number;
  emptyMessage?: string;
  className?: string;
}

export function PaginationTable<T>({
  data,
  renderHeader,
  renderRow,
  keyExtractor,
  defaultPageSize = 25,
  emptyMessage = 'No records found for the selected filter.',
  className = ''
}: PaginationTableProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const totalPages = Math.ceil(data.length / pageSize) || 1;

  // Reset to page 1 if data length or page size changes out of range
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (safePage - 1) * pageSize;
    return data.slice(startIdx, startIdx + pageSize);
  }, [data, safePage, pageSize]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
            {renderHeader()}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item, idx) => renderRow(item, (safePage - 1) * pageSize + idx))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-300 ml-1">|</span>
            <span className="font-medium ml-1">
              Showing <strong className="text-slate-900">{(safePage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-900">{Math.min(safePage * pageSize, data.length)}</strong> of{' '}
              <strong className="text-slate-900">{data.length}</strong> records
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
