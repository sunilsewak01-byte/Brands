import React, { useMemo, useState } from 'react';
import { FlaskConical, GitMerge, Pill, Dna, Search, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import FilterRibbon from '../components/FilterRibbon';
import StatCard from '../components/StatCard';

export default function MoleculesPage() {
  const {
    filteredReconciledData,
    standardizedFields,
    openDrilldown,
    setDossierProduct
  } = usePortfolio();

  const f = standardizedFields;
  const [moleculeSearch, setMoleculeSearch] = useState('');
  const [viewTab, setViewTab] = useState('classes'); // 'classes', 'apis', 'fdcs'

  // Extract all individual APIs and their occurrences
  const apiFrequency = useMemo(() => {
    const counts = {};
    const apiToProducts = {};

    filteredReconciledData.forEach((row) => {
      const comp = String(row[f.composition] || '').trim();
      if (!comp || comp === '-') return;

      // Split combinations by semicolon, plus, or comma
      const parts = comp.split(/[;+,]/).map((p) => p.trim()).filter(Boolean);
      parts.forEach((api) => {
        counts[api] = (counts[api] || 0) + 1;
        if (!apiToProducts[api]) apiToProducts[api] = [];
        apiToProducts[api].push(row);
      });
    });

    return Object.entries(counts)
      .map(([api, count]) => ({
        api,
        count,
        products: apiToProducts[api],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredReconciledData, f]);

  // Extract Pharmacological Classes
  const pharmClasses = useMemo(() => {
    const map = {};
    filteredReconciledData.forEach((row) => {
      let pClass = String(row[f.pharmClass] || 'Unassigned').trim();
      if (pClass === 'null' || pClass === '-' || !pClass) pClass = 'Unassigned';

      if (!map[pClass]) {
        map[pClass] = {
          name: pClass,
          products: [],
        };
      }
      map[pClass].products.push(row);
    });

    return Object.values(map).sort((a, b) => b.products.length - a.products.length);
  }, [filteredReconciledData, f]);

  // FDCs vs Monotherapy
  const fdcProducts = useMemo(() => {
    return filteredReconciledData.filter((r) => {
      const comp = String(r[f.composition] || '');
      return comp.includes(';') || comp.includes('+') || comp.includes(',');
    });
  }, [filteredReconciledData, f]);

  const singleProducts = useMemo(() => {
    return filteredReconciledData.filter((r) => {
      const comp = String(r[f.composition] || '');
      return !(comp.includes(';') || comp.includes('+') || comp.includes(','));
    });
  }, [filteredReconciledData, f]);

  // Filtered list based on search
  const filteredApiList = useMemo(() => {
    if (!moleculeSearch) return apiFrequency;
    const q = moleculeSearch.toLowerCase();
    return apiFrequency.filter((item) => item.api.toLowerCase().includes(q));
  }, [apiFrequency, moleculeSearch]);

  const filteredClassList = useMemo(() => {
    if (!moleculeSearch) return pharmClasses;
    const q = moleculeSearch.toLowerCase();
    return pharmClasses.filter((item) => item.name.toLowerCase().includes(q));
  }, [pharmClasses, moleculeSearch]);

  return (
    <div className="space-y-6">
      <FilterRibbon />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Distinct Molecules (APIs)"
          value={apiFrequency.length}
          icon={FlaskConical}
          colorScheme="sky"
          onClick={() => setViewTab('apis')}
        />
        <StatCard
          title="Pharmacological Classes"
          value={pharmClasses.length}
          icon={Dna}
          colorScheme="amber"
          onClick={() => setViewTab('classes')}
        />
        <StatCard
          title="FDC Combinations"
          value={fdcProducts.length}
          icon={GitMerge}
          colorScheme="indigo"
          onClick={() => setViewTab('fdcs')}
        />
        <StatCard
          title="Single Molecules"
          value={singleProducts.length}
          icon={Pill}
          colorScheme="emerald"
          onClick={() =>
            openDrilldown('Single Molecule', 'Monotherapy Active Ingredients', (r) => {
              const comp = String(r[f.composition] || '');
              return !(comp.includes(';') || comp.includes('+') || comp.includes(','));
            })
          }
        />
      </div>

      {/* Navigation Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewTab('classes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewTab === 'classes' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Classes ({pharmClasses.length})
          </button>
          <button
            onClick={() => setViewTab('apis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewTab === 'apis' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            APIs ({apiFrequency.length})
          </button>
          <button
            onClick={() => setViewTab('fdcs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewTab === 'fdcs' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FDCs ({fdcProducts.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes or molecules..."
            value={moleculeSearch}
            onChange={(e) => setMoleculeSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg custom-ring text-slate-800"
          />
        </div>
      </div>

      {/* VIEW TAB 1: Pharmacological Classes */}
      {viewTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassList.map((pc) => (
            <div
              key={pc.name}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:border-amber-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    Functional Class
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {pc.products.length} {pc.products.length > 1 ? 'Products' : 'Product'}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mt-2">{pc.name}</h4>

                <div className="mt-3 space-y-1.5">
                  {pc.products.map((p) => (
                    <div
                      key={p[f.id] || p['__group_id__']}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{p[f.brand]}</p>
                        <p className="text-[11px] text-slate-500">{p[f.composition]}</p>
                      </div>
                      <button
                        onClick={() => setDossierProduct(p)}
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-800"
                      >
                        Specs
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  openDrilldown('Pharmacological Class', pc.name, (r) => String(r[f.pharmClass] || '').trim() === pc.name)
                }
                className="w-full py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition text-center"
              >
                Inspect {pc.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VIEW TAB 2: Active APIs Ranking */}
      {viewTab === 'apis' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-sky-600" />
              Active Pharmaceutical Ingredients Frequency
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-4">Active Molecule (API)</th>
                  <th className="py-2.5 px-4 w-28 text-center">Associated SKUs</th>
                  <th className="py-2.5 px-4">Formulations / Brands</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApiList.map((item, idx) => (
                  <tr key={item.api} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400 font-bold">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <span className="text-sm">{item.api}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800">
                        {item.count}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.products.map((p) => (
                          <span
                            key={p[f.id] || p['__group_id__']}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]"
                          >
                            {p[f.brand]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() =>
                          openDrilldown('API Molecule', item.api, (r) =>
                            String(r[f.composition] || '').toLowerCase().includes(item.api.toLowerCase())
                          )
                        }
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                      >
                        Filter SKUs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW TAB 3: FDCs Combinations Matrix */}
      {viewTab === 'fdcs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fdcProducts.map((p) => {
            const parts = String(p[f.composition] || '').split(/[;+,]/).map((x) => x.trim()).filter(Boolean);
            return (
              <div
                key={p[f.id] || p['__group_id__']}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {p[f.id]}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {p[f.therapeutic]}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {parts.length}-API Synergy
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 mt-2">{p[f.brand]}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{p[f.strength]}</p>

                  {/* Combination components pills */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Active Components
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parts.map((pt, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 font-bold text-xs"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">Class: </span>
                    <span>{p[f.pharmClass]}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Franchise: <strong className="text-slate-800">{p[f.team]}</strong></span>
                  <button
                    onClick={() => setDossierProduct(p)}
                    className="font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
