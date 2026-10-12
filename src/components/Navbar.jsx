import React from 'react';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  FilterX,
  PlusCircle,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Navbar() {
  const {
    activePage,
    setActivePage,
    filters,
    updateFilter,
    clearAllFilters,
    reconciledData,
    filteredReconciledData,
    exportExcel,
    exportCsv,
    copyTsv
  } = usePortfolio();

  const getPageInfo = () => {
    switch (activePage) {
      case 'overview':
        return { title: 'Executive Portfolio Studio' };
      case 'therapeutic':
        return { title: 'Therapeutic & Clinical Intelligence' };
      case 'molecules':
        return { title: 'Molecules & Formulation Studio' };
      case 'commercial':
        return { title: 'Commercial Franchises & Teams' };
      case 'innovators':
        return { title: 'Originator & Innovator Landscape' };
      case 'explorer':
        return { title: 'Unified Product Master Explorer' };
      case 'reconcile':
        return { title: 'Reconciliation & Data Engine' };
      default:
        return { title: 'ReconcileX Studio' };
    }
  };

  const pageInfo = getPageInfo();
  const hasActiveFilters =
    filters.therapeutic !== 'ALL' ||
    filters.team !== 'ALL' ||
    filters.productType !== 'ALL' ||
    filters.route !== 'ALL' ||
    filters.innovator !== 'ALL' ||
    filters.searchQuery !== '';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Page Titles */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-100">
              {filteredReconciledData.length} of {reconciledData.length} SKUs
            </span>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg custom-ring text-slate-800 placeholder-slate-400 focus:bg-white transition"
            />
          </div>

          {/* Active Filter Clear Tag */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Export Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportExcel()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => exportCsv()}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => copyTsv()}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">TSV</span>
            </button>
          </div>

          {/* Quick Engine Link */}
          {activePage !== 'reconcile' && (
            <button
              onClick={() => setActivePage('reconcile')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Reconcile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
