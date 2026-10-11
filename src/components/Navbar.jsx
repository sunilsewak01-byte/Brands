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
        return {
          title: 'Executive Portfolio Studio',
          subtitle: 'High-level KPIs, therapeutic distributions, franchise splits & originator footprint'
        };
      case 'therapeutic':
        return {
          title: 'Therapeutic & Clinical Intelligence',
          subtitle: 'Detailed analysis across clinical domains, therapeutic indications & medical roles'
        };
      case 'molecules':
        return {
          title: 'Molecules & Formulation Studio',
          subtitle: 'Monotherapy vs FDC fixed combinations, API strengths & functional pharmacological classes'
        };
      case 'commercial':
        return {
          title: 'Commercial Franchises & Teams',
          subtitle: 'Division portfolios, therapeutic assignments, route modalities & business unit metrics'
        };
      case 'innovators':
        return {
          title: 'Originator & Innovator Landscape',
          subtitle: 'Global innovator brand reference benchmarks, patent originator mapping & generic equivalents'
        };
      case 'explorer':
        return {
          title: 'Unified Product Master Explorer',
          subtitle: 'Comprehensive searchable dossier table with multi-column sorting and regulatory drilldown'
        };
      case 'reconcile':
        return {
          title: 'Reconciliation & Data Engine',
          subtitle: 'Multi-row deduplication, custom delimiter tokenization and source row audit trails'
        };
      default:
        return { title: 'ReconcileX Studio', subtitle: 'Pharma Portfolio Intelligence' };
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
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search portfolio..."
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
              title="Clear all active filters"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          {/* Export Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportExcel()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95"
              title="Export Current View to Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => exportCsv()}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => copyTsv()}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
              title="Copy Tab-Separated Values to Clipboard"
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
              <span>Upload / Reconcile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
