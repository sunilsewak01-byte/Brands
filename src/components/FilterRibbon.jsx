import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function FilterRibbon() {
  const {
    filters,
    updateFilter,
    clearAllFilters,
    filterOptions,
    reconciledData,
    filteredReconciledData,
  } = usePortfolio();

  const isFiltered =
    filters.therapeutic !== 'ALL' ||
    filters.team !== 'ALL' ||
    filters.productType !== 'ALL' ||
    filters.route !== 'ALL' ||
    filters.innovator !== 'ALL';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Portfolio Dynamic Cross-Filters
          </span>
          {isFiltered && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              Active Filter
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Showing <strong className="text-sky-700 font-bold">{filteredReconciledData.length}</strong> of {reconciledData.length} records
          </span>
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Therapeutic Area
          </label>
          <select
            value={filters.therapeutic}
            onChange={(e) => updateFilter('therapeutic', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white custom-ring text-slate-800"
          >
            <option value="ALL">All Therapies ({filterOptions.therapeutic.length})</option>
            {filterOptions.therapeutic.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Commercial Team
          </label>
          <select
            value={filters.team}
            onChange={(e) => updateFilter('team', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white custom-ring text-slate-800"
          >
            <option value="ALL">All Teams ({filterOptions.team.length})</option>
            {filterOptions.team.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Product Type
          </label>
          <select
            value={filters.productType}
            onChange={(e) => updateFilter('productType', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white custom-ring text-slate-800"
          >
            <option value="ALL">All Types ({filterOptions.productType.length})</option>
            {filterOptions.productType.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Route of Delivery
          </label>
          <select
            value={filters.route}
            onChange={(e) => updateFilter('route', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white custom-ring text-slate-800"
          >
            <option value="ALL">All Routes ({filterOptions.route.length})</option>
            {filterOptions.route.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Innovator Company
          </label>
          <select
            value={filters.innovator}
            onChange={(e) => updateFilter('innovator', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white custom-ring text-slate-800"
          >
            <option value="ALL">All Innovators ({filterOptions.innovator.length})</option>
            {filterOptions.innovator.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
