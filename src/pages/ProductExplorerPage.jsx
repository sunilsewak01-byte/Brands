import React, { useState, useMemo } from 'react';
import {
  TableProperties,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Copy,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Key
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import FilterRibbon from '../components/FilterRibbon';

export default function ProductExplorerPage() {
  const {
    filteredReconciledData,
    headersList,
    standardizedFields,
    setDossierProduct,
    openAuditModal,
    exportExcel,
    exportCsv,
    copyTsv
  } = usePortfolio();

  const f = standardizedFields;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredReconciledData;
    return [...filteredReconciledData].sort((a, b) => {
      const vA = a[sortCol] !== undefined ? String(a[sortCol]).toLowerCase() : '';
      const vB = b[sortCol] !== undefined ? String(b[sortCol]).toLowerCase() : '';
      return sortAsc ? vA.localeCompare(vB, undefined, { numeric: true }) : vB.localeCompare(vA, undefined, { numeric: true });
    });
  }, [filteredReconciledData, sortCol, sortAsc]);

  const total = sortedData.length;
  const maxPages = Math.ceil(total / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = sortedData.slice(startIdx, endIdx);

  const handleHeaderClick = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      <FilterRibbon />

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        {/* Table Top Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Unified Master Products
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              ({total} records in view)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExcel()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => exportCsv()}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => copyTsv()}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy TSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto relative min-h-[350px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 w-10 text-center text-slate-400">#</th>
                <th className="py-3 px-3 w-20 text-center">Audit</th>
                {headersList.map((col) => {
                  const isKey = col === f.id;
                  const isSorted = sortCol === col;
                  return (
                    <th
                      key={col}
                      onClick={() => handleHeaderClick(col)}
                      className="py-3 px-3 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 transition"
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-1.5">
                        {isKey && <Key className="w-3 h-3 text-sky-600" />}
                        <span className={isKey ? 'text-sky-700 font-bold' : ''}>{col}</span>
                        {isSorted && (
                          <span className="text-sky-600 font-bold">{sortAsc ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-center sticky right-0 bg-slate-100/95 shadow-sm">
                  Dossier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={headersList.length + 3} className="text-center py-16 text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => {
                  const mergeCount = row['__row_count__'] || 1;
                  const groupId = row['__group_id__'];
                  const isMerged = mergeCount > 1;

                  return (
                    <tr key={idx} className="hover:bg-sky-50/40 transition border-b border-slate-100">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {startIdx + idx + 1}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => openAuditModal(groupId)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition hover:scale-105 ${
                            isMerged
                              ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                          title={isMerged ? `${mergeCount} original source rows merged` : '1 raw row'}
                        >
                          <Layers className="w-2.5 h-2.5" />
                          <span>{mergeCount}</span>
                        </button>
                      </td>

                      {headersList.map((col) => {
                        const val = row[col] !== undefined ? String(row[col]) : '';
                        const isKey = col === f.id;
                        const hasMultiple = val.includes(';');

                        if (isKey) {
                          return (
                            <td key={col} className="py-2.5 px-3 font-mono font-bold text-sky-800 whitespace-nowrap">
                              {val}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={col}
                            className="py-2.5 px-3 max-w-xs truncate"
                            title={val}
                          >
                            {hasMultiple ? (
                              <span className="font-semibold text-slate-900">{val}</span>
                            ) : val ? (
                              <span className="text-slate-700">{val}</span>
                            ) : (
                              <span className="text-slate-300 italic">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-center sticky right-0 bg-white/95">
                        <button
                          onClick={() => setDossierProduct(row)}
                          className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-300 rounded-lg shadow-sm transition flex items-center gap-1 mx-auto"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 custom-ring font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 font-medium">
              Showing {total > 0 ? startIdx + 1 : 0} to {endIdx} of {total} records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800">
              Page {currentPage} of {maxPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(maxPages, p + 1))}
              disabled={currentPage >= maxPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
