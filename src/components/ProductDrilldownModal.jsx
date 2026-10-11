import React, { useState, useMemo } from 'react';
import { X, Search, Download, FileText, Pill } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function ProductDrilldownModal() {
  const {
    drilldownModalInfo,
    setDrilldownModalInfo,
    setDossierProduct,
    standardizedFields,
    exportExcel
  } = usePortfolio();

  const [query, setQuery] = useState('');

  const items = drilldownModalInfo?.items || [];
  const tag = drilldownModalInfo?.tag || '';
  const title = drilldownModalInfo?.title || '';
  const f = standardizedFields;

  const filteredItems = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase().trim();
    return items.filter((r) => {
      return [
        r[f.id],
        r[f.brand],
        r[f.composition],
        r[f.pharmClass],
        r[f.therapeutic],
        r[f.team],
        r[f.innovatorCompany],
      ].some((v) => v && String(v).toLowerCase().includes(q));
    });
  }, [items, query, f]);

  if (!drilldownModalInfo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                {tag}
              </span>
              <span className="text-xs text-slate-400">Drilldown Selection</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Detailed Product Subset: <span className="text-sky-700">{title}</span> ({filteredItems.length} items)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExcel(filteredItems, `Subset_${title.replace(/\s+/g, '_')}.xlsx`)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Subset</span>
            </button>
            <button
              onClick={() => setDrilldownModalInfo(null)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Input inside Modal */}
        <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search within this drilldown (Brand, Molecule, Class, Franchise)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg custom-ring text-slate-800"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing {filteredItems.length} of {items.length} records
          </span>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Product ID</th>
                <th className="py-2.5 px-3">Brand Name</th>
                <th className="py-2.5 px-3">Composition / Strength</th>
                <th className="py-2.5 px-3">Therapeutic Area</th>
                <th className="py-2.5 px-3">Pharmacological Class</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">Route / Form</th>
                <th className="py-2.5 px-3">Originator Brand</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Pill className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-300" />
                    No products matched your search query in this subset.
                  </td>
                </tr>
              ) : (
                filteredItems.map((row, idx) => {
                  const idVal = row[f.id] || '-';
                  const brandVal = row[f.brand] || '-';
                  const compVal = row[f.composition] || '-';
                  const strVal = row[f.strength] || '';
                  const areaVal = row[f.therapeutic] || '-';
                  const pClassVal = row[f.pharmClass] || '-';
                  const teamVal = row[f.team] || '-';
                  const routeVal = row[f.route] || '-';
                  const formVal = row[f.dosageForm] || '';
                  const innBrand = row[f.innovatorBrand] || '-';

                  return (
                    <tr key={idx} className="hover:bg-sky-50/50 transition border-b border-slate-100">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800 whitespace-nowrap">
                        {idVal}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {brandVal}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{compVal}</div>
                        {strVal && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{strVal}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {areaVal}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate" title={pClassVal}>
                        <span className="font-medium text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                          {pClassVal}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {teamVal}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        <div>{routeVal}</div>
                        {formVal && <div className="text-[10px] text-slate-400">{formVal}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {innBrand}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setDossierProduct(row)}
                          className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-300 rounded-lg shadow-sm transition flex items-center gap-1 mx-auto"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Click <strong className="text-sky-700">View Dossier</strong> on any row to inspect complete clinical & posology specs.
          </span>
          <button
            onClick={() => setDrilldownModalInfo(null)}
            className="font-semibold px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
