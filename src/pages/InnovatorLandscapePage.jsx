import React, { useMemo, useState } from 'react';
import { Award, Building2, Shield, Search, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import FilterRibbon from '../components/FilterRibbon';
import StatCard from '../components/StatCard';

export default function InnovatorLandscapePage() {
  const {
    filteredReconciledData,
    standardizedFields,
    openDrilldown,
    setDossierProduct
  } = usePortfolio();

  const f = standardizedFields;
  const [searchComp, setSearchComp] = useState('');

  // Group by Innovator Company
  const innovatorGroups = useMemo(() => {
    const map = {};
    let unassignedCount = 0;

    filteredReconciledData.forEach((row) => {
      let company = String(row[f.innovatorCompany] || '').trim();
      if (!company || company === 'Not available' || company === '-' || company === 'null' || company === 'generic') {
        company = 'Generic / Non-Referenced';
        unassignedCount++;
      }

      if (!map[company]) {
        map[company] = {
          company,
          products: [],
          brands: new Set(),
        };
      }
      map[company].products.push(row);
      const b = String(row[f.innovatorBrand] || '').trim();
      if (b && b !== '-') map[company].brands.add(b);
    });

    return Object.values(map).sort((a, b) => b.products.length - a.products.length);
  }, [filteredReconciledData, f]);

  const assignedInnovators = useMemo(() => {
    return innovatorGroups.filter((g) => g.company !== 'Generic / Non-Referenced');
  }, [innovatorGroups]);

  const filteredInnovators = useMemo(() => {
    if (!searchComp) return assignedInnovators;
    const q = searchComp.toLowerCase();
    return assignedInnovators.filter(
      (g) =>
        g.company.toLowerCase().includes(q) ||
        Array.from(g.brands).some((b) => b.toLowerCase().includes(q))
    );
  }, [assignedInnovators, searchComp]);

  const totalAssignedProducts = assignedInnovators.reduce((acc, curr) => acc + curr.products.length, 0);

  return (
    <div className="space-y-6">
      <FilterRibbon />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Originator Companies"
          value={assignedInnovators.length}
          icon={Building2}
          colorScheme="purple"
          onClick={() => openDrilldown('Originators', 'Innovator Originators', () => true)}
        />
        <StatCard
          title="Innovator-Referenced SKUs"
          value={totalAssignedProducts}
          icon={Award}
          colorScheme="sky"
          onClick={() =>
            openDrilldown('Originator Products', 'All Innovator Benchmarked Products', (r) => {
              const c = String(r[f.innovatorCompany] || '').toLowerCase();
              return c && c !== 'not available' && c !== '-' && c !== 'generic';
            })
          }
        />
        <StatCard
          title="Top Originator Partner"
          value={assignedInnovators[0] ? assignedInnovators[0].company : 'N/A'}
          icon={Shield}
          colorScheme="indigo"
          onClick={() => {
            if (assignedInnovators[0]) {
              openDrilldown('Innovator', assignedInnovators[0].company, (r) => String(r[f.innovatorCompany] || '').trim() === assignedInnovators[0].company);
            }
          }}
        />
        <StatCard
          title="Innovator Brands"
          value={assignedInnovators.reduce((acc, g) => acc + g.brands.size, 0)}
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => openDrilldown('Originator Brands', 'All Innovator Brands', () => true)}
        />
      </div>

      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Global Originators & Innovator Brands Directory
          </h3>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or brand (e.g. AbbVie, Bayer, Orilissa)..."
            value={searchComp}
            onChange={(e) => setSearchComp(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg custom-ring text-slate-800"
          />
        </div>
      </div>

      {/* Innovator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInnovators.map((ig) => (
          <div
            key={ig.company}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-purple-300 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{ig.company}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-purple-700">{ig.products.length}</span>
                  <span className="text-xs text-slate-400 font-medium ml-1">SKUs</span>
                </div>
              </div>

              {/* Originator Reference Brands */}
              <div className="mt-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Referenced Originator Brand(s)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(ig.brands).map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200/60"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Internal Products Matching */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Matched Portfolio Products
                </span>
                <div className="divide-y divide-slate-100">
                  {ig.products.map((p) => (
                    <div
                      key={p[f.id] || p['__group_id__']}
                      className="py-1.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 mr-2">{p[f.brand]}</span>
                        <span className="text-slate-500 text-[11px]">{p[f.composition]}</span>
                      </div>
                      <button
                        onClick={() => setDossierProduct(p)}
                        className="text-[11px] font-semibold text-purple-600 hover:text-purple-800"
                      >
                        Specs
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                openDrilldown('Originator Portfolio', ig.company, (r) => String(r[f.innovatorCompany] || '').trim() === ig.company)
              }
              className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
            >
              <span>Inspect Products ({ig.products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
